// frontend/src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import MenuPage from './pages/MenuPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/CheckoutPage';
import Orders from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrdersPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Loading from './components/Loading';

// Route Guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  return user ? children : <Navigate to="/login" />;
};

const SellerRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'SELLER') return <Navigate to="/home" />;
  return children;
};

const BuyerRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'BUYER') return <Navigate to="/seller/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  if (user) return <Navigate to={user.role === 'SELLER' ? '/seller/dashboard' : '/home'} />;
  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (loading) return <Loading />;

  return (
    <>
      {user && !isLandingPage && <Header />}
      <main style={{
        minHeight: '100vh',
        background: user && !isLandingPage ? 'linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%)' : 'transparent',
      }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />

          {/* Buyer Routes */}
          <Route
            path="/home"
            element={
              <BuyerRoute>
                <HomePage />
              </BuyerRoute>
            }
          />
          <Route
            path="/search"
            element={
              <BuyerRoute>
                <SearchPage />
              </BuyerRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <PrivateRoute>
                <MenuPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <PrivateRoute>
                <ProductDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <BuyerRoute>
                <CartPage />
              </BuyerRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <BuyerRoute>
                <Checkout />
              </BuyerRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <BuyerRoute>
                <Orders />
              </BuyerRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <BuyerRoute>
                <OrderDetailPage />
              </BuyerRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <BuyerRoute>
                <WishlistPage />
              </BuyerRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Seller Routes */}
          <Route
            path="/seller/dashboard"
            element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <SellerRoute>
                <SellerProducts />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <SellerRoute>
                <SellerOrders />
              </SellerRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {user && !isLandingPage && <Footer />}
    </>
  );
}

export default App;
