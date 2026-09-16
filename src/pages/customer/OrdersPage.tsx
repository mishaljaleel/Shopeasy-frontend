import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import api from '../../api/client';
import { Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get<Order[]>('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Paid':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Your Orders</h1>
        <p className="text-xs text-slate-500 mt-1">Track current shipments and view purchase history</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading your purchase history...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.orderID}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4 hover:border-indigo-100 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500">ORDER #{o.orderID}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(o.orderDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      {o.paymentMethod || 'Card'} ({o.paymentStatus || 'Pending'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(o.status)}`}>
                    {o.status}
                  </span>
                  <Link
                    to={`/orders/${o.orderID}/track`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    <span>Track Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {o.items.map((item) => (
                  <div key={item.orderItemID} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.productName}</p>
                        <p className="text-slate-400">Qty: {item.quantity} &times; ₹{item.unitPrice.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹{item.lineTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Shipped to: <strong className="text-slate-700">{o.address?.fullName}</strong> ({o.address?.city})
                </span>
                <div className="text-right">
                  <span className="text-slate-400 mr-2">Total:</span>
                  <span className="text-base font-black text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500">Once you purchase items, their status and shipment tracking will appear here.</p>
          <Link to="/" className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
            Explore Store
          </Link>
        </div>
      )}
    </div>
  );
};
