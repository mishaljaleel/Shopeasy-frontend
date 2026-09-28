import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Package, ShoppingBag, AlertTriangle, Plus, Edit2, Trash2, 
  RefreshCw, History, ArrowUpRight, ArrowDownRight, Download, Upload, FileSpreadsheet, CheckCircle2
} from 'lucide-react';
import api from '../../api/client';
import { Product, MerchantAnalytics, InventoryLog, Category } from '../../types';

export const MerchantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'lowstock'>('overview');
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

  // Bulk Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

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
        imageUrl: formImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
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
        notes: restockNotes || 'Restock batch update',
      });
      setShowRestockModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to restock product.');
    }
  };

  const handleQuickRestock = (productId: number, recommended: number) => {
    setRestockProductId(productId);
    setRestockQty(recommended);
    setRestockNotes('Automated low-stock restock batch');
    setShowRestockModal(true);
  };

  // 1-Click CSV Export (Section 4.2 of Synopsis)
  const handleExportCsv = () => {
    if (products.length === 0) {
      alert('No products available to export.');
      return;
    }
    const headers = ['ProductID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Rating'];
    const rows = products.map((p) => [
      p.productID,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.categoryName}"`,
      p.price,
      p.stock,
      p.status,
      p.avgRating,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `easyshop_products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk CSV Import (Section 4.2 of Synopsis)
  const downloadSampleTemplate = () => {
    const template = `Name,CategoryID,Price,Stock,Description,ImageUrl\n"Wireless Gaming Mouse",1,2499,30,"RGB ergonomic lightweight gaming mouse","https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800"\n"Slim Portable Powerbank 20000mAh",1,1899,25,"Fast charging USB-C dual output powerbank","https://images.unsplash.com/photo-1609592424360-6421597d515a?w=800"`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'easyshop_bulk_product_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportCsvText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleProcessBulkImport = async () => {
    if (!importCsvText.trim()) {
      alert('Please select or paste CSV content.');
      return;
    }
    setImportLoading(true);
    setImportResult(null);
    try {
      const lines = importCsvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain header row and at least one product.');
      }
      let successCount = 0;
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple CSV splitter handling quotes
        const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (match && match.length >= 4) {
          const name = match[0].replace(/^"|"$/g, '');
          const catId = Number(match[1].replace(/^"|"$/g, '')) || formCatId;
          const price = Number(match[2].replace(/^"|"$/g, '')) || 999;
          const stock = Number(match[3].replace(/^"|"$/g, '')) || 10;
          const desc = match[4] ? match[4].replace(/^"|"$/g, '') : 'Imported catalog item';
          const img = match[5]
            ? match[5].replace(/^"|"$/g, '')
            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

          await api.post('/products', {
            name,
            categoryID: catId,
            price,
            stock,
            description: desc,
            imageUrl: img,
            status: 'Active',
          });
          successCount++;
        }
      }
      setImportResult(`Successfully imported ${successCount} products into your catalog!`);
      fetchData();
      setTimeout(() => {
        setShowImportModal(false);
        setImportResult(null);
        setImportCsvText('');
      }, 2000);
    } catch (err: any) {
      setImportResult(`Import error: ${err.message || 'Failed to process CSV file.'}`);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Merchant Storefront Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control catalog, bulk import/export, monitor low stock, and inspect audit logs</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            title="Export Products to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition"
            title="Bulk Import Products from CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Store Analytics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'products' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Catalog Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('lowstock')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'lowstock' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Low-Stock Alerts</span>
          {(analytics?.lowStockAlerts?.length || 0) > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {analytics?.lowStockAlerts?.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inventory Audit Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: Store Analytics */}
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

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">Top-Selling Products by Revenue</h2>
            {analytics.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400">No sales recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.topProducts.map((tp) => (
                  <div key={tp.productID} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{tp.name}</p>
                      <p className="text-slate-400 font-mono mt-0.5">{tp.totalSold} units sold</p>
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{tp.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Catalog Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider">
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

      {/* TAB 3: Low-Stock Alerts & Restock Recommendations (Section 10.5 of Synopsis) */}
      {activeTab === 'lowstock' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Low-Stock Inventory Alerts & Recommendations</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated threshold monitoring flagging items with stock &le; 10 units
              </p>
            </div>
          </div>

          {!analytics?.lowStockAlerts || analytics.lowStockAlerts.length === 0 ? (
            <div className="text-center py-12 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-800">All inventory levels are healthy</p>
              <p className="text-xs text-emerald-600 mt-0.5">No products currently require immediate restocking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Current Stock</th>
                    <th className="pb-3">Recommended Restock</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.lowStockAlerts.map((item) => (
                    <tr key={item.productID} className="hover:bg-amber-50/30">
                      <td className="py-3.5 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3.5 text-slate-600">{item.categoryName}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {item.currentStock} units
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-indigo-600">
                        +{item.recommendedRestock} units
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleQuickRestock(item.productID, item.recommendedRestock)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Restock +{item.recommendedRestock}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Inventory Audit Logs */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Inventory Audit Trail (Immutable Event Log)</span>
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.logID} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{log.productName}</p>
                  <p className="text-slate-400 mt-0.5">{log.notes || 'Routine stock alteration'}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(log.loggedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    log.delta > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {log.delta > 0 ? `+${log.delta}` : log.delta} units ({log.operation})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Product Title</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Category</label>
                  <select value={formCatId} onChange={(e) => setFormCatId(Number(e.target.value))} className="mt-1 w-full px-3 py-2 border rounded-xl bg-white">
                    {categories.map((c) => (
                      <option key={c.categoryID} value={c.categoryID}>{c.name}</option>
                    ))}
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

      {/* Restock Inventory Modal */}
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
                <label className="block font-semibold text-slate-700">Notes / Batch Reference</label>
                <input type="text" value={restockNotes} onChange={(e) => setRestockNotes(e.target.value)} placeholder="Restock batch #2026" className="mt-1 w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRestockModal(false)} className="px-4 py-2 border rounded-xl font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Confirm Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Product Import Modal (Section 4.2 of Synopsis) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Bulk Product CSV Import</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Upload a standard CSV file or paste the CSV text below to rapidly populate your storefront catalog.
            </p>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Need the CSV structure?</span>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Download Sample CSV
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Choose CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Or Paste CSV Content</label>
              <textarea
                rows={5}
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder={'Name,CategoryID,Price,Stock,Description,ImageUrl\n"Product Name",1,999,50,"Description","https://..."'}
                className="w-full p-3 font-mono text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {importResult && (
              <div className={`p-3 rounded-xl text-xs font-medium ${
                importResult.startsWith('Successfully')
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {importResult}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border rounded-xl font-semibold text-slate-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importLoading || !importCsvText.trim()}
                onClick={handleProcessBulkImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition disabled:bg-slate-300"
              >
                {importLoading ? 'Importing Products...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
