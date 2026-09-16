import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SignalRProvider } from './context/SignalRContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { CatalogPage } from './pages/customer/CatalogPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { MerchantDashboard } from './pages/merchant/MerchantDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Role Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading profile...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SignalRProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Storefront */}
                  <Route path="/" element={<CatalogPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />

                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Customer Authenticated */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['Customer', 'Merchant', 'Admin']}>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={['Customer', 'Merchant', 'Admin']}>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id/track"
                    element={
                      <ProtectedRoute allowedRoles={['Customer', 'Merchant', 'Admin']}>
                        <OrderTrackingPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Merchant Authenticated */}
                  <Route
                    path="/merchant"
                    element={
                      <ProtectedRoute allowedRoles={['Merchant', 'Admin']}>
                        <MerchantDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Authenticated */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </SignalRProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

