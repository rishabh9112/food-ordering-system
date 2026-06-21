import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RestaurantList from './pages/RestaurantList';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import './index.css';

import { CartProvider } from './context/CartContext';

/* Smart home route: landing for guests, /restaurants for authenticated users */
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/restaurants" replace />;
  return <LandingPage />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Landing / home */}
              <Route path="/" element={<HomeRoute />} />

              {/* Public auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Customer protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/restaurants" element={<RestaurantList />} />
                <Route path="/restaurants/:restaurantId/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />
              </Route>

              {/* Admin protected */}
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
