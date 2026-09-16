import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';
import { Address, Order } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  // New address form
  const [fullName, setFullName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'COD'>('Card');
  const [cardNumber, setCardNumber] = useState('4532 8820 9012 3456');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('883');
  const [upiId, setUpiId] = useState('alex@okaxis');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get<Address[]>('/orders/addresses');
      setAddresses(res.data);
      if (res.data.length > 0) {
        setSelectedAddressId(res.data[0].addressID);
      } else {
        setShowNewAddress(true);
      }
    } catch (err) {
      console.error(err);
      setShowNewAddress(true);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        items: items.map((i) => ({
          productId: i.product.productID,
          quantity: i.quantity,
        })),
        paymentMethod,
      };

      if (showNewAddress || !selectedAddressId) {
        payload.newAddress = {
          fullName,
          addressLine,
          city,
          state,
          zipCode,
          phone,
        };
      } else {
        payload.addressID = selectedAddressId;
      }

      // 1. Create Order
      const orderRes = await api.post<Order>('/orders', payload);
      const createdOrder = orderRes.data;

      // 2. Process mock payment if not COD
      if (paymentMethod !== 'COD') {
        await api.post('/payments/process', {
          orderId: createdOrder.orderID,
          method: paymentMethod,
          cardNumber: paymentMethod === 'Card' ? cardNumber : undefined,
          upiId: paymentMethod === 'UPI' ? upiId : undefined,
        });
      }

      clearCart();
      navigate(`/orders/${createdOrder.orderID}/track`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-black text-slate-900">Secure Order Checkout</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address and Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address Section */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Shipping Destination
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  {showNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {!showNewAddress && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label
                    key={a.addressID}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === a.addressID
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === a.addressID}
                      onChange={() => setSelectedAddressId(a.addressID)}
                      className="mt-1 accent-indigo-600"
                    />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-800">{a.fullName}</p>
                      <p className="text-slate-600">{a.addressLine}, {a.city}, {a.state} - {a.zipCode}</p>
                      <p className="text-slate-500">Phone: {a.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Flat / Building, Road, Locality"
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">PIN / Zip Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="560001"
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Payment Gateway Simulation (PCI-DSS Compliant)
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                Credit/Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1" />
                Instant UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1" />
                Cash on Delivery
              </button>
            </div>

            {paymentMethod === 'Card' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 pt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Simulated Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 pt-3">
                <label className="block text-[11px] font-semibold text-slate-600">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="user@upi"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono"
                />
                <p className="text-[11px] text-slate-400">Supported apps: Google Pay, PhonePe, Paytm, BHIM</p>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-800">
                You can pay in cash or via digital UPI QR upon package arrival at your doorstep.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Review ({items.length} items)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.productID} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {quantity} &times; ₹{product.price.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="font-bold text-slate-800">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Processing Transaction...' : `Confirm & Pay ₹${subtotal.toLocaleString('en-IN')}`}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
