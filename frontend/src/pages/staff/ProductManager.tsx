import { useEffect, useState } from 'react';
import type { Product, ProductCategory } from '../../types';
import type { ProductInput } from '../../types/staff';
import {
  createProduct,
  getProducts,
  toggleProductAvailability,
  updateProductPrice,
} from '../../api/staff';
import { formatPrice } from '../../utils';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  BURGERS: 'Burgers',
  SIDES: 'Sides',
  DRINKS: 'Drinks',
  DESSERTS: 'Desserts',
  COMBOS: 'Combos',
};

const emptyForm: ProductInput = {
  name: '',
  description: '',
  price: 0,
  category: 'BURGERS',
};

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProducts()
      .then((data) => {
        if (mounted) {
          setProducts(data);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateProductPrice(editing.id, form.price);
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, price: updated.price } : p))
        );
      } else {
        const created = await createProduct(form);
        setProducts((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    const updated = await toggleProductAvailability(id);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Manage the menu catalog
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-lg bg-brand-red text-white font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-neutral-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col"
            >
              <div className="h-36 bg-neutral-100 relative flex items-center justify-center text-neutral-300">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    product.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {product.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="p-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {CATEGORY_LABELS[product.category]}
                    </p>
                  </div>
                  <span className="font-bold text-brand-red">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </div>
                {product.description && (
                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="px-4 py-3 border-t border-neutral-100 flex gap-2">
                <button
                  onClick={() => handleToggle(product.id)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    product.available
                      ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {product.available ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => openEdit(product)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  Edit Price
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
            onClick={() => setShowForm(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-in-right">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900">
                  {editing ? 'Edit Price' : 'Add Product'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100"
                  aria-label="Close form"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                {editing ? (
                  <div>
                    <label htmlFor="p-price" className="block text-sm font-medium text-neutral-700 mb-1">
                      Price (cents)
                    </label>
                    <input
                      id="p-price"
                      type="number"
                      min={1}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    />
                    <p className="text-sm text-neutral-600 mt-3">
                      Name, description and category cannot be changed through the API.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="p-name" className="block text-sm font-medium text-neutral-700 mb-1">
                        Name
                      </label>
                      <input
                        id="p-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                        placeholder="e.g. Spicy Chicken Burger"
                      />
                    </div>

                    <div>
                      <label htmlFor="p-desc" className="block text-sm font-medium text-neutral-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="p-desc"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none resize-none"
                        placeholder="Short description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="p-price" className="block text-sm font-medium text-neutral-700 mb-1">
                          Price (cents)
                        </label>
                        <input
                          id="p-price"
                          type="number"
                          min={1}
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="p-cat" className="block text-sm font-medium text-neutral-700 mb-1">
                          Category
                        </label>
                        <select
                          id="p-cat"
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value as ProductCategory })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white"
                        >
                          {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (editing ? form.price <= 0 : !form.name)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-brand-red text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editing ? 'Save Price' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
