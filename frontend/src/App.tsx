import { useNavigate, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './hooks/useCart';
import { OrdersProvider, useOrders } from './hooks/useOrders';
import { AuthProvider, useAuth, useIsStaff } from './hooks/useAuth';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmation } from './pages/OrderConfirmationPage';
import { OrdersPage } from './pages/OrdersPage';
import { StaffLayout, type StaffPage } from './pages/staff/StaffLayout';
import { DashboardPage } from './pages/staff/DashboardPage';
import { OrdersManagement } from './pages/staff/OrdersManagement';
import { KitchenDisplay } from './pages/staff/KitchenDisplay';
import { ProductManager } from './pages/staff/ProductManager';
import { LoginPage } from './pages/LoginPage';
import './App.css';

function MenuRoute() {
  const { addItem } = useCart();
  return <MenuPage onAddToCart={addItem} />;
}

function CartRoute() {
  const navigate = useNavigate();
  return (
    <CartPage
      onCheckout={() => navigate('/checkout')}
      onContinueShopping={() => navigate('/')}
    />
  );
}

function CheckoutRoute() {
  const navigate = useNavigate();
  return (
    <CustomerLayout currentPage="checkout">
      <CheckoutPage
        onOrderPlaced={() => navigate('/confirmation')}
        onBack={() => navigate('/cart')}
      />
    </CustomerLayout>
  );
}

function ConfirmationRoute() {
  const navigate = useNavigate();
  const { lastPlacedOrder } = useOrders();

  if (!lastPlacedOrder) {
    return (
      <CustomerLayout currentPage="confirmation">
        <div className="max-w-2xl mx-auto py-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No order found.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 rounded-lg bg-brand-red text-white font-semibold"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="confirmation">
      <div className="max-w-2xl mx-auto py-6">
        <OrderConfirmation
          orderId={lastPlacedOrder.id}
          orderNumber={lastPlacedOrder.orderNumber}
          items={lastPlacedOrder.items}
          total={lastPlacedOrder.total}
          onContinueShopping={() => navigate('/')}
        />
      </div>
    </CustomerLayout>
  );
}

function OrdersRoute() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  return (
    <CustomerLayout currentPage="orders">
      <OrdersPage
        orders={orders}
        onOrderSelect={() => navigate('/orders')}
        onBackToMenu={() => navigate('/')}
      />
    </CustomerLayout>
  );
}

interface StaffShellProps {
  page: StaffPage;
  children: React.ReactNode;
}

function StaffShell({ page, children }: StaffShellProps) {
  const navigate = useNavigate();
  return (
    <StaffLayout
      activePage={page}
      onNavigate={(p) => navigate(`/staff/${p}`)}
      onExit={() => navigate('/')}
    >
      {children}
    </StaffLayout>
  );
}

function RequireStaff({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const isStaff = useIsStaff();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isStaff) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<CustomerLayout currentPage="menu"><MenuRoute /></CustomerLayout>} />
      <Route path="/cart" element={<CustomerLayout currentPage="cart"><CartRoute /></CustomerLayout>} />
      <Route path="/checkout" element={<CheckoutRoute />} />
      <Route path="/confirmation" element={<ConfirmationRoute />} />
      <Route path="/orders" element={<OrdersRoute />} />
      <Route
        path="/staff"
        element={
          <RequireStaff>
            <StaffShell page="dashboard"><DashboardPage /></StaffShell>
          </RequireStaff>
        }
      />
      <Route
        path="/staff/orders"
        element={
          <RequireStaff>
            <StaffShell page="orders"><OrdersManagement /></StaffShell>
          </RequireStaff>
        }
      />
      <Route
        path="/staff/kitchen"
        element={
          <RequireStaff>
            <StaffShell page="kitchen"><KitchenDisplay /></StaffShell>
          </RequireStaff>
        }
      />
      <Route
        path="/staff/products"
        element={
          <RequireStaff>
            <StaffShell page="products"><ProductManager /></StaffShell>
          </RequireStaff>
        }
      />
      <Route path="*" element={<CustomerLayout currentPage="menu"><MenuRoute /></CustomerLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <CartProvider>
          <OrdersProvider>
            <AppRoutes />
          </OrdersProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
