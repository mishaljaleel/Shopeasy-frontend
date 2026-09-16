import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your shopping cart is empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our marketplace catalog and add items you'd like to purchase.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          Start Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">Shopping Cart ({items.length} items)</h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.productID}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-4"
            >
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-xl bg-slate-100"
              />

              <div className="flex-1 text-center sm:text-left">
                <Link to={`/products/${product.productID}`} className="font-bold text-sm text-slate-900 hover:text-indigo-600">
                  {product.name}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{product.categoryName}</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => updateQuantity(product.productID, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.productID, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Line Total & Remove */}
              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <span className="text-sm font-black text-slate-900">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => removeFromCart(product.productID)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline pt-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Continue browsing products
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md space-y-6 h-fit">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Platform & GST Taxes</span>
              <span className="font-semibold text-slate-800">₹0 (Included)</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
