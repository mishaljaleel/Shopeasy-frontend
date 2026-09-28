import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, items } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inCart = items.some((i) => i.product.productID === product.productID);
  const isWishlisted = isInWishlist(product.productID);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.productID);
    } else {
      addToWishlist(product);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
      {/* Product Image */}
      <Link to={`/products/${product.productID}`} className="relative block aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide bg-white/90 backdrop-blur-md rounded-full text-indigo-700 shadow-xs">
            {product.categoryName}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 shadow-sm transition hover:scale-110"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md shadow-xs">
              Only {product.stock} left
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 font-bold text-xs uppercase tracking-wider text-white bg-red-600 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-amber-500 mb-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-700">{product.avgRating.toFixed(1)}</span>
          <span className="text-slate-400 text-[11px]">({product.reviewCount})</span>
        </div>

        <Link to={`/products/${product.productID}`}>
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 line-clamp-1 transition-colors text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {product.description || 'Premium quality product available with fast shipping and manufacturer warranty.'}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-medium">Price</p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">{formattedPrice}</p>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : inCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs shadow-indigo-200 active:scale-95'
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
