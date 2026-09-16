import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, ShoppingBag, Plus, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../api/client';
import { AdminAnalytics, AdminUser, Order, Category } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'categories'>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [catName, setCatName] = useState('');
  const [catParent, setCatParent] = useState<number | null>(null);

  // Add Store modal state
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storePassword, setStorePassword] = useState('StorePass123!');
  const [creatingStore, setCreatingStore] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes, ordersRes, catsRes] = await Promise.all([
        api.get<AdminAnalytics>('/analytics/admin'),
        api.get<AdminUser[]>('/admin/users'),
        api.get<Order[]>('/orders/all'),
        api.get<Category[]>('/categories'),
      ]);

      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUser = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await api.post('/categories', {
        name: catName,
        parentID: catParent,
      });
      setCatName('');
      setCatParent(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStore(true);
    try {
      await api.post('/admin/create-store', {
        storeName: storeName.trim(),
        email: storeEmail.trim(),
        password: storePassword,
      });
      setShowAddStoreModal(false);
      setStoreName('');
      setStoreEmail('');
      setStorePassword('StorePass123!');
      alert('Merchant store onboarded successfully!');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create merchant store.');
    } finally {
      setCreatingStore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-black text-slate-900">Platform Administrator Console</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Centralized governance, store onboarding, moderation, and order fulfillment</p>
        </div>

        <button
          onClick={() => setShowAddStoreModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Merchant Store</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'overview' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Moderation ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'orders' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Order Fulfillment ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'categories' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Category Taxonomy ({categories.length})
        </button>
      </div>

      {activeTab === 'overview' && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Gross Platform GMV</span>
            <p className="text-2xl font-black text-slate-900">₹{analytics.totalPlatformRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Platform Orders</span>
            <p className="text-2xl font-black text-slate-900">{analytics.totalOrders}</p>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Shoppers</span>
            <p className="text-2xl font-black text-slate-900">{analytics.totalCustomers}</p>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Registered Sellers</span>
            <p className="text-2xl font-black text-slate-900">{analytics.totalMerchants}</p>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Catalog Items</span>
            <p className="text-2xl font-black text-slate-900">{analytics.totalProducts}</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Registration</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.userID} className="hover:bg-slate-50/80">
                    <td className="py-3.5">
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{u.orderCount}</td>
                    <td className="py-3.5">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                          <XCircle className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {u.role !== 'Admin' && (
                        <button
                          onClick={() => handleToggleUser(u.userID)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                            u.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Current Status</th>
                  <th className="pb-3 text-right">Update (SignalR Broadcast)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.orderID} className="hover:bg-slate-50/80">
                    <td className="py-3.5 font-mono font-bold text-slate-900">#{o.orderID}</td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-800">{o.customerName}</p>
                      <p className="text-[11px] text-slate-400">{o.customerEmail}</p>
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(o.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 font-black text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.orderID, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" /> Add Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Smart Wearables"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Parent Category</label>
                <select
                  value={catParent || ''}
                  onChange={(e) => setCatParent(e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">None (Top-Level)</option>
                  {categories.map((c) => (
                    <option key={c.categoryID} value={c.categoryID}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="md:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Hierarchical Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.categoryID} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                  </div>
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-3 border-l-2 border-purple-300">
                      {cat.subCategories.map((sub) => (
                        <span key={sub.categoryID} className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600">
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Provision New Merchant Store</h3>
            </div>
            <p className="text-xs text-slate-500">
              Register a new seller account on the platform with instant storefront and merchant dashboard access.
            </p>

            <form onSubmit={handleCreateStore} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Store / Merchant Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Apex Electronics Hub"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Merchant Email</label>
                <input
                  type="email"
                  required
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  placeholder="seller@store.com"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Initial Password</label>
                <input
                  type="text"
                  required
                  value={storePassword}
                  onChange={(e) => setStorePassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStore}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {creatingStore ? 'Onboarding Store...' : 'Create & Onboard Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
