import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_MODE } from '../api/config';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/menu';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardTitle, CardDescription } from '../components/ui/Card';

type LoginMode = 'customer' | 'staff';
type CustomerView = 'login' | 'register';

interface LoginPageProps {}

export function LoginPage({}: LoginPageProps) {
  const navigate = useNavigate();
  const { loginCustomer, loginStaff, registerCustomer } = useAuth();
  const [mode, setMode] = useState<LoginMode>('customer');
  const [customerView, setCustomerView] = useState<CustomerView>('login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer login form state
  const [customerLoginForm, setCustomerLoginForm] = useState({
    phone: '',
    nationality: '+57',
    password: '',
  });

  // Customer register form state
  const [customerRegisterForm, setCustomerRegisterForm] = useState({
    name: '',
    phone: '',
    nationality: '+57',
    password: '',
    confirmPassword: '',
  });

  // Staff login form state
  const [staffLoginForm, setStaffLoginForm] = useState({
    username: '',
    password: '',
  });

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginCustomer({
        phone: customerLoginForm.phone,
        nationality: customerLoginForm.nationality,
        password: customerLoginForm.password,
      });
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (customerRegisterForm.password !== customerRegisterForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerCustomer({
        name: customerRegisterForm.name,
        phone: customerRegisterForm.phone,
        nationality: customerRegisterForm.nationality,
        password: customerRegisterForm.password,
      });
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginStaff({
        username: staffLoginForm.username,
        password: staffLoginForm.password,
      });
      navigate('/staff');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoCustomerLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginCustomer({
        phone: '(555) 123-4567',
        nationality: '+57',
        password: 'customer123',
      });
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoStaffLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginStaff({
        username: 'admin',
        password: 'admin123',
      });
      navigate('/staff');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (hasError: boolean) => `
    w-full rounded-lg border px-4 py-3 text-neutral-900 placeholder-neutral-400
    focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-colors
    ${hasError ? 'border-error bg-red-50' : 'border-neutral-300'}
  `;

  const labelClasses = 'block text-sm font-medium text-neutral-700 mb-1.5';

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">FF</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Fast Foodiy</h1>
          <p className="text-neutral-600 mt-1">Sign in to continue</p>
        </div>

        {/* Demo Mode Banner */}
        {DEMO_MODE && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 text-amber-800 text-sm font-medium mb-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Demo Mode Enabled
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDemoCustomerLogin}
                disabled={isSubmitting}
                className="flex-1 min-w-[140px]"
              >
                Autologin Cliente
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDemoStaffLogin}
                disabled={isSubmitting}
                className="flex-1 min-w-[140px]"
              >
                Autologin Staff Admin
              </Button>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mb-6" role="tablist" aria-label="Login mode">
          <div className="flex bg-neutral-100 rounded-xl p-1">
            <button
              role="tab"
              aria-selected={mode === 'customer'}
              aria-controls="customer-panel"
              id="customer-tab"
              onClick={() => {
                setMode('customer');
                setCustomerView('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'customer'
                  ? 'bg-white text-brand-red shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Cliente
            </button>
            <button
              role="tab"
              aria-selected={mode === 'staff'}
              aria-controls="staff-panel"
              id="staff-tab"
              onClick={() => {
                setMode('staff');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'staff'
                  ? 'bg-white text-brand-red shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Staff
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-slide-in-right"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Customer Login/Register Panel */}
        <div
          role="tabpanel"
          id="customer-panel"
          aria-labelledby="customer-tab"
          hidden={mode !== 'customer'}
          className="animate-fade-in"
        >
          {customerView === 'login' ? (
            <Card className="shadow-xl border-neutral-200">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
                </div>

                <form onSubmit={handleCustomerLogin} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="phone" className={labelClasses}>
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={customerLoginForm.phone}
                      onChange={(e) => setCustomerLoginForm({ ...customerLoginForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className={inputClasses(false)}
                      autoComplete="tel"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="nationality" className={labelClasses}>
                      Nationality
                    </label>
                    <input
                      id="nationality"
                      type="text"
                      value={customerLoginForm.nationality}
                      onChange={(e) => setCustomerLoginForm({ ...customerLoginForm, nationality: e.target.value })}
                      placeholder="+57"
                      className={inputClasses(false)}
                      autoComplete="off"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClasses}>
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={customerLoginForm.password}
                      onChange={(e) => setCustomerLoginForm({ ...customerLoginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className={inputClasses(false)}
                      autoComplete="current-password"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Ingresar
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setCustomerView('register')}
                    className="text-brand-red font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 rounded"
                    disabled={isSubmitting}
                  >
                    Regístrate
                  </button>
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-neutral-200">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <CardTitle className="text-2xl">Create Account</CardTitle>
                  <CardDescription>Join Fast Foodiy today</CardDescription>
                </div>

                <form onSubmit={handleCustomerRegister} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="reg-name" className={labelClasses}>
                      Full Name
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      value={customerRegisterForm.name}
                      onChange={(e) => setCustomerRegisterForm({ ...customerRegisterForm, name: e.target.value })}
                      placeholder="Your name"
                      className={inputClasses(false)}
                      autoComplete="name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className={labelClasses}>
                      Phone Number
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      value={customerRegisterForm.phone}
                      onChange={(e) => setCustomerRegisterForm({ ...customerRegisterForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className={inputClasses(false)}
                      autoComplete="tel"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-nationality" className={labelClasses}>
                      Nationality
                    </label>
                    <input
                      id="reg-nationality"
                      type="text"
                      value={customerRegisterForm.nationality}
                      onChange={(e) => setCustomerRegisterForm({ ...customerRegisterForm, nationality: e.target.value })}
                      placeholder="+57"
                      className={inputClasses(false)}
                      autoComplete="off"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-password" className={labelClasses}>
                      Password
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      value={customerRegisterForm.password}
                      onChange={(e) => setCustomerRegisterForm({ ...customerRegisterForm, password: e.target.value })}
                      placeholder="••••••••"
                      className={inputClasses(false)}
                      autoComplete="new-password"
                      required
                      disabled={isSubmitting}
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-confirm-password" className={labelClasses}>
                      Confirm Password
                    </label>
                    <input
                      id="reg-confirm-password"
                      type="password"
                      value={customerRegisterForm.confirmPassword}
                      onChange={(e) => setCustomerRegisterForm({ ...customerRegisterForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className={inputClasses(false)}
                      autoComplete="new-password"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Crear cuenta
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCustomerView('login')}
                    className="text-brand-red font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 rounded"
                    disabled={isSubmitting}
                  >
                    Sign in
                  </button>
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Staff Login Panel */}
        <div
          role="tabpanel"
          id="staff-panel"
          aria-labelledby="staff-tab"
          hidden={mode !== 'staff'}
          className="animate-fade-in"
        >
          <Card className="shadow-xl border-neutral-200">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <CardTitle className="text-2xl">Staff Console</CardTitle>
                <CardDescription>Sign in to access the dashboard</CardDescription>
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="username" className={labelClasses}>
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={staffLoginForm.username}
                    onChange={(e) => setStaffLoginForm({ ...staffLoginForm, username: e.target.value })}
                    placeholder="admin"
                    className={inputClasses(false)}
                    autoComplete="username"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="staff-password" className={labelClasses}>
                    Password
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    value={staffLoginForm.password}
                    onChange={(e) => setStaffLoginForm({ ...staffLoginForm, password: e.target.value })}
                    placeholder="••••••••"
                    className={inputClasses(false)}
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-neutral-500">
          Fast Foodiy — Restaurant Order Management
        </p>
      </div>
    </div>
  );
}