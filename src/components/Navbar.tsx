import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, LayoutDashboard, Shield, PackageCheck, Search, Heart, UserCircle, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-indigo-600 font-extrabold text-2xl tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span>Easy<span className="text-slate-900">Shop</span></span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search laptops, headphones, apparel..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </form>

        {/* Navigation Links & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block"
          >
            Explore
          </Link>

          {!user && (
            <Link
              to="/register?role=Merchant"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-indigo-500" />
              <span>Become a Seller</span>
            </Link>
          )}

          {user?.role === 'Merchant' && (
            <Link
              to="/merchant"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Merchant Portal</span>
            </Link>
          )}

          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative p-2 text-slate-700 hover:text-rose-600 transition-colors rounded-full hover:bg-slate-100"
            title="My Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2 text-slate-700 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-100"
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-100 transition"
                title="Account & Address Book"
              >
                <UserCircle className="w-5 h-5 text-indigo-600" />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-1">{user.name}</p>
                  <p className="text-[10px] text-indigo-600 font-medium uppercase">{user.role}</p>
                </div>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all shadow-indigo-200"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

