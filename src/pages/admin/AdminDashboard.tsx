import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, ShoppingBag, Plus, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Truck, FileBarChart2 } from 'lucide-react';
import api from '../../api/client';
import { AdminAnalytics, AdminUser, Order, Category } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'categories' | 'reports'>('overview');
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
          <p className="text-xs text-slate-500 mt-0.5">Centralized governance, store onboarding, reports, and fraud detection</p>
        </div>

        <button
          onClick={() => setShowAddStoreModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Merchant Store</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileBarChart2 className="w-3.5 h-3.5" />
          <span>Reports & Fulfillment Log</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Moderation ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Order Fulfillment ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
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

      {/* TAB 2: Reports & Fulfillment Log (Section 10.5 of Synopsis) */}
      {activeTab === 'reports' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Acquisition Summary */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Customer Acquisition Summary</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  +{analytics.customerAcquisition?.customerGrowthRate || 0}% Growth
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 block font-medium">Total Registered Users</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {analytics.customerAcquisition?.totalUsers || analytics.totalCustomers + analytics.totalMerchants}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-2xl">
                  <span className="text-indigo-600 block font-medium">New Shoppers This Month</span>
                  <span className="text-xl font-black text-indigo-900 mt-1 block">
                    {analytics.customerAcquisition?.newUsersThisMonth || 0}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500 space-y-1.5 pt-2">
                <div className="flex justify-between">
                  <span>Shoppers (Buyers):</span>
                  <span className="font-bold text-slate-800">{analytics.totalCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sellers (Merchants):</span>
                  <span className="font-bold text-slate-800">{analytics.totalMerchants}</span>
                </div>
              </div>
            </div>

            {/* Order Fulfillment Log */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Order Fulfillment Log</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  {analytics.orderFulfillment?.fulfillmentRate || 100}% Fulfillment Rate
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-amber-50">
                  <span className="text-[10px] text-amber-700 uppercase font-semibold">Pending</span>
                  <p className="text-lg font-bold text-amber-900 mt-0.5">{analytics.orderFulfillment?.pendingOrders || 0}</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-indigo-50">
                  <span className="text-[10px] text-indigo-700 uppercase font-semibold">Shipped</span>
                  <p className="text-lg font-bold text-indigo-900 mt-0.5">{analytics.orderFulfillment?.shippedOrders || 0}</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-emerald-50">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold">Delivered</span>
                  <p className="text-lg font-bold text-emerald-900 mt-0.5">{analytics.orderFulfillment?.deliveredOrders || 0}</p>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 flex justify-between">
                <span>Cancelled / Returned Orders:</span>
                <span className="font-bold text-rose-600">{analytics.orderFulfillment?.cancelledOrders || 0}</span>
              </div>
            </div>
          </div>

          {/* Fraud Detection & Velocity Checks (Section 11.4 of Synopsis) */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Fraud Detection & Velocity Checks</h3>
              </div>
              <span className="text-[11px] text-slate-500">Automated High-Risk Screening Rules</span>
            </div>

            {!analytics.highRiskOrders || analytics.highRiskOrders.length === 0 ? (
              <div className="text-center py-8 bg-emerald-50/40 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-emerald-800">No anomalous transaction velocity detected</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">All customer orders comply with standard velocity safety thresholds.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="pb-2">Order ID</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Risk Trigger Reason</th>
                      <th className="pb-2 text-right">Security Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.highRiskOrders.map((hro) => (
                      <tr key={hro.orderID} className="hover:bg-amber-50/40">
                        <td className="py-3 font-mono font-bold text-slate-800">#{hro.orderID}</td>
                        <td className="py-3 font-medium text-slate-700">{hro.customerName}</td>
                        <td className="py-3 font-bold text-slate-900">₹{hro.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-slate-500 text-[11px]">{hro.riskReason}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            hro.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {hro.isVerified ? 'Verified' : 'Manual Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'Merchant' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{u.orderCount}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleToggleUser(u.userID)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                          u.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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
                  <th className="pb-3">Risk Assessment</th>
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
                      {o.totalAmount >= 50000 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          ⚠️ High-Value Review
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                      )}
                    </td>
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
                className="w-full py-2 bg-purple-600 text-white font-bold rounded-xl"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="md:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Existing Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((c) => (
                <div key={c.categoryID} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">slug: {c.slug}</p>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 font-semibold">
                    {c.productCount} SKUs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Onboard Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Onboard New Merchant Store</h3>
            <form onSubmit={handleCreateStore} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Store / Merchant Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Apex Electronics"
                  className="mt-1 w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Merchant Email</label>
                <input
                  type="email"
                  required
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="mt-1 w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Initial Password</label>
                <input
                  type="password"
                  required
                  value={storePassword}
                  onChange={(e) => setStorePassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStore}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold"
                >
                  {creatingStore ? 'Onboarding...' : 'Create Merchant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
