import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, ArrowLeft, Radio } from 'lucide-react';
import api from '../../api/client';
import { Order } from '../../types';
import { useSignalR } from '../../context/SignalRContext';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { connection } = useSignalR();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  useEffect(() => {
    if (connection && id) {
      connection.invoke('JoinOrderGroup', id).catch(() => {});

      const handleStatusChanged = (data: { orderId: number; newStatus: string }) => {
        if (data.orderId.toString() === id) {
          setOrder((prev) => (prev ? { ...prev, status: data.newStatus as any } : null));
        }
      };

      connection.on('OrderStatusChanged', handleStatusChanged);
      return () => {
        connection.off('OrderStatusChanged', handleStatusChanged);
      };
    }
  }, [connection, id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get<Order>(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Pending', icon: Clock, desc: 'Order received & awaiting payment confirmation' },
    { label: 'Paid', icon: CheckCircle2, desc: 'Payment verified & order queued for merchant dispatch' },
    { label: 'Shipped', icon: Truck, desc: 'In transit with logistics courier' },
    { label: 'Delivered', icon: PackageCheck, desc: 'Successfully delivered to shipping address' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Paid': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">Loading live tracking details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-2">
        <h2 className="text-lg font-bold text-slate-800">Order not found</h2>
        <Link to="/orders" className="text-xs text-indigo-600 font-semibold">Return to Orders</Link>
      </div>
    );
  }

  const currentIdx = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-md space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Order #{order.orderID} Tracking</h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Live SignalR Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Placed on {new Date(order.orderDate).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Total Amount</p>
            <p className="text-xl font-black text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Live Stepper */}
        {isCancelled ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
            <AlertCircle className="w-5 h-5" />
            <p className="font-semibold">This order was cancelled. Reserved inventory was returned to stock.</p>
          </div>
        ) : (
          <div className="py-6">
            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 w-full z-0">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Step Circles */}
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                        isPassed
                          ? 'bg-indigo-600 text-white shadow-indigo-200'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-indigo-100 scale-110' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-bold mt-2 ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-[100px] text-center hidden sm:block mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shipping Address & Item Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Shipping Destination</h3>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-slate-600">
              <p className="font-bold text-slate-900">{order.address?.fullName}</p>
              <p>{order.address?.addressLine}</p>
              <p>{order.address?.city}, {order.address?.state} - {order.address?.zipCode}</p>
              <p>Phone: {order.address?.phone}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Package Items</h3>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              {order.items.map((it) => (
                <div key={it.orderItemID} className="flex justify-between items-center text-slate-700">
                  <span className="truncate pr-2 font-medium">{it.productName} &times; {it.quantity}</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">₹{it.lineTotal.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
