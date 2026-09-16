import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Package, ShoppingBag, AlertTriangle, Plus, Edit2, Trash2, 
  RefreshCw, History, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import api from '../../api/client';
import { Product, MerchantAnalytics, InventoryLog, Category } from '../../types';

export const MerchantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory'>('overview');
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);

  // Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockProductId, setRestockProductId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [restockNotes, setRestockNotes] = useState('');

  // Product Form
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState(999);
  const [formStock, setFormStock] = useState(20);
  const [formCatId, setFormCatId] = useState<number>(1);
  const [formImg, setFormImg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, productsRes, catsRes, logsRes] = await Promise.all([
        api.get<MerchantAnalytics>('/analytics/merchant'),
        api.get<Product[]>('/products/merchant'),
        api.get<Category[]>('/categories'),
        api.get<InventoryLog[]>('/inventory/merchant'),
      ]);

      setAnalytics(analyticsRes.data);
      setProducts(productsRes.data);
      setCategories(catsRes.data);
      setLogs(logsRes.data);
      if (catsRes.data.length > 0) setFormCatId(catsRes.data[0].categoryID);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormPrice(1999);
    setFormStock(25);
    setFormImg('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800');
    setShowProductModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormPrice(p.price);
    setFormStock(p.stock);
    setFormCatId(p.categoryID);
    setFormImg(p.imageUrl || '');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        description: formDesc,
        price: Number(formPrice),
        stock: Number(formStock),
        categoryID: Number(formCatId),
        imageUrl: formImg,
        status: 'Active',
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.productID}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setShowProductModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to archive this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId) return;
    try {
      await api.post('/inventory/restock', {
        productID: restockProductId,
        quantity: Number(restockQty),
        notes: restockNotes,
      });
      setShowRestockModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to restock product.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Merchant Storefront Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control catalog, monitor stock levels, and inspect audit logs</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Store Analytics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'products' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Catalog Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inventory Audit Logs ({logs.length})
        </button>
      </div>

      {activeTab === 'overview' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sales</span>
              <p className="text-2xl font-black text-slate-900">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Orders Volume</span>
              <p className="text-2xl font-black text-slate-900">{analytics.totalOrders}</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active SKUs</span>
              <p className="text-2xl font-black text-slate-900">{analytics.activeProducts}</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock SKUs</span>
              <p className="text-2xl font-black text-slate-900">{analytics.lowStockCount}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.productID} className="hover:bg-slate-50/80">
                    <td className="py-3.5 flex items-center gap-3">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">#{p.productID}</p>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600">{p.categoryName}</td>
                    <td className="py-3.5 font-bold text-slate-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p.stock <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-amber-500">★ {p.avgRating.toFixed(1)}</td>
                    <td className="py-3.5 text-right space-x-1">
                      <button
                        onClick={() => { setRestockProductId(p.productID); setShowRestockModal(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600"
                        title="Restock"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.productID)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                        title="Archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" /> Stock Audit Logs (3NF InventoryLogs)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Operation</th>
                  <th className="pb-3 text-center">Delta</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.logID} className="hover:bg-slate-50/80">
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{new Date(log.loggedAt).toLocaleString()}</td>
                    <td className="py-3 font-semibold text-slate-800">{log.productName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{log.operation}</span>
                    </td>
                    <td className="py-3 text-center font-bold font-mono">
                      <span className={log.delta > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {log.delta > 0 ? `+${log.delta}` : log.delta}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 italic text-[11px]">{log.notes || 'System transaction'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Name</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Category</label>
                  <select value={formCatId} onChange={(e) => setFormCatId(Number(e.target.value))} className="mt-1 w-full px-3 py-2 border rounded-xl bg-white">
                    {categories.map((c) => (<option key={c.categoryID} value={c.categoryID}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Price (₹)</label>
                  <input type="number" min={1} required value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} className="mt-1 w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Stock</label>
                  <input type="number" min={0} required value={formStock} onChange={(e) => setFormStock(Number(e.target.value))} className="mt-1 w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Image URL</label>
                  <input type="url" value={formImg} onChange={(e) => setFormImg(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Description</label>
                <textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="mt-1 w-full p-2 border rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 border rounded-xl font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRestockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Restock Product Inventory</h3>
            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Units to Add</label>
                <input type="number" min={1} required value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))} className="mt-1 w-full px-3 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Notes</label>
                <input type="text" value={restockNotes} onChange={(e) => setRestockNotes(e.target.value)} placeholder="Restock batch batch#2026" className="mt-1 w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRestockModal(false)} className="px-4 py-2 border rounded-xl font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
