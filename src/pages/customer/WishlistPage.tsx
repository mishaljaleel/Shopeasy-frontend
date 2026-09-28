import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product.productID);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Wishlist</h1>
          <p className="text-sm text-slate-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-red-600 hover:text-red-700 font-medium py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-50 transition"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Your wishlist is empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Explore our curated catalog and tap the heart icon on any product to save items you love.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {wishlist.map((product) => (
            <div
              key={product.productID}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
            >
              <div className="relative aspect-video bg-slate-50 overflow-hidden">
                <img
                  src={
                    product.imageUrl ||
                    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(product.productID)}
                  title="Remove from wishlist"
                  className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur rounded-full text-slate-400 hover:text-red-500 shadow-sm transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                    {product.categoryName}
                  </span>
                  <Link to={`/products/${product.productID}`}>
                    <h3 className="font-semibold text-slate-800 text-sm mt-2 line-clamp-1 hover:text-indigo-600 transition">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-1">
                    <span>★ {product.avgRating.toFixed(1)}</span>
                    <span className="text-slate-400">({product.reviewCount})</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-base font-bold text-slate-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock <= 0}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white transition shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
