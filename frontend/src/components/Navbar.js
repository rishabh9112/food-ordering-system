import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-icon">🍔</span>
          <span className="brand-name">FoodOrder</span>
        </Link>
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {!user ? (
          <>
            <li><Link to="/login" className="nav-link" onClick={close}>Login</Link></li>
            <li><Link to="/signup" className="nav-link nav-cta" onClick={close}>Sign Up</Link></li>
          </>
        ) : (
          <>
            {!isAdmin() && (
              <>
                <li><Link to="/restaurants" className="nav-link" onClick={close}>Restaurants</Link></li>
                <li>
                  <Link to="/cart" className="nav-link" onClick={close}>
                    🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>
                </li>
                <li><Link to="/orders" className="nav-link" onClick={close}>My Orders</Link></li>
              </>
            )}
            {isAdmin() && (
              <li><Link to="/admin" className="nav-link" onClick={close}>Admin Panel</Link></li>
            )}
            {/* Profile link — visible for both roles */}
            <li>
              <Link to="/profile" className="nav-link nav-profile-link" onClick={close}>
                <span className="nav-avatar">{user.name?.charAt(0)?.toUpperCase()}</span>
                {user.name}
              </Link>
            </li>
            <li>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
