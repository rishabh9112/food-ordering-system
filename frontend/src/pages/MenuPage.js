import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

/* Build a map: menuItemId -> { cartItemId, quantity } from cart response */
const buildCartMap = (cartData) => {
  const map = {};
  (cartData?.items || []).forEach((ci) => {
    map[ci.menuItem.id] = { cartItemId: ci.id, quantity: ci.quantity };
  });
  return map;
};

const MenuPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { updateCartCount } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartMap, setCartMap] = useState({}); // menuItemId -> { cartItemId, quantity }
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // menuItemId being updated
  const [toast, setToast] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterVeg, setFilterVeg] = useState('all'); // all | veg | nonveg
  const [availableOnly, setAvailableOnly] = useState(false);

  /* ── Initial data load ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, menuRes, cartRes] = await Promise.all([
          api.get(`/restaurants/${restaurantId}`),
          api.get(`/restaurants/${restaurantId}/menu`),
          api.get('/cart').catch(() => ({ data: { items: [] } })), // guests won't have cart
        ]);
        setRestaurant(restRes.data);
        setMenuItems(menuRes.data);
        setCartMap(buildCartMap(cartRes.data));
        updateCartCount(cartRes.data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
      } catch {
        navigate('/restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, navigate]);

  /* ── Toast helper ── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  /* ── Cart actions ── */
  const addToCart = async (item) => {
    setUpdatingId(item.id);
    try {
      const { data } = await api.post('/cart/add', { menuItemId: item.id, quantity: 1 });
      setCartMap(buildCartMap(data));
      updateCartCount(data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
      showToast(`${item.name} added!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setUpdatingId(null);
    }
  };

  const increment = async (item) => {
    const entry = cartMap[item.id];
    if (!entry) return;
    setUpdatingId(item.id);
    try {
      const { data } = await api.post('/cart/add', { menuItemId: item.id, quantity: 1 });
      setCartMap(buildCartMap(data));
      updateCartCount(data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
    } catch {
      showToast('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const decrement = async (item) => {
    const entry = cartMap[item.id];
    if (!entry) return;
    setUpdatingId(item.id);
    try {
      let data;
      if (entry.quantity <= 1) {
        ({ data } = await api.delete(`/cart/remove/${entry.cartItemId}`));
      } else {
        ({ data } = await api.put(`/cart/update/${entry.cartItemId}`, {
          quantity: entry.quantity - 1,
        }));
      }
      setCartMap(buildCartMap(data));
      updateCartCount(data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
    } catch {
      showToast('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Filtering ── */
  const filtered = menuItems.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterVeg === 'veg' && !item.isVeg) return false;
    if (filterVeg === 'nonveg' && item.isVeg) return false;
    if (availableOnly && !item.isAvailable) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page menu-page">
      {toast && <div className="toast">{toast}</div>}

      {/* Restaurant header */}
      {restaurant && (
        <div className="restaurant-hero glass">
          <div className="restaurant-hero-content">
            <h1>{restaurant.name}</h1>
            <p>{restaurant.description}</p>
            <span className="meta-item">📍 {restaurant.location || 'Location N/A'}</span>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="search-bar-wrapper">
        <input
          id="menu-search"
          className="search-input"
          type="text"
          placeholder="🔍 Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${filterVeg === 'all' ? 'active' : ''}`}
          onClick={() => setFilterVeg('all')}
        >🍴 All</button>
        <button
          className={`filter-btn ${filterVeg === 'veg' ? 'active' : ''}`}
          onClick={() => setFilterVeg('veg')}
        >🥗 Veg</button>
        <button
          className={`filter-btn ${filterVeg === 'nonveg' ? 'active' : ''}`}
          onClick={() => setFilterVeg('nonveg')}
        >🍗 Non-Veg</button>
        <button
          className={`filter-btn ${availableOnly ? 'active' : ''}`}
          onClick={() => setAvailableOnly((v) => !v)}
        >✅ Available Only</button>
      </div>

      {/* Menu items */}
      {Object.keys(grouped).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No items found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="menu-category">
            <h2 className="category-title">{category}</h2>
            <div className="menu-grid">
              {items.map((item) => {
                const cartEntry = cartMap[item.id];
                const isUpdating = updatingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`menu-card glass ${!item.isAvailable ? 'menu-card-unavailable' : ''}`}
                  >
                    <div className="menu-card-details">
                      <div className="menu-card-header">
                        <span className={`veg-badge ${item.isVeg ? 'veg' : 'nonveg'}`}>
                          {item.isVeg ? '🟢' : '🔴'}
                        </span>
                        <h3>{item.name}</h3>
                        {!item.isAvailable && (
                          <span className="unavail-tag">Unavailable</span>
                        )}
                      </div>
                      <p className="menu-desc">{item.description}</p>
                      <div className="menu-footer">
                        <span className="menu-price">₹{item.price}</span>

                        {/* Fixed-width action area — no layout shift */}
                        <div className="menu-action-area">
                          {!item.isAvailable ? (
                            <span className="menu-unavail-dash">—</span>
                          ) : cartEntry ? (
                            <div className="quantity-controls">
                              <button
                                className="qty-btn"
                                onClick={() => decrement(item)}
                                disabled={isUpdating}
                                aria-label="Decrease quantity"
                              >−</button>
                              <span className="qty-value">{cartEntry.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => increment(item)}
                                disabled={isUpdating}
                                aria-label="Increase quantity"
                              >+</button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary menu-add-btn"
                              onClick={() => addToCart(item)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? <span className="btn-spinner" /> : '+ Add'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cloudinary menu item image */}
                    <div className="menu-card-img-wrapper">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="menu-card-img" />
                      ) : (
                        <div className="menu-card-img-placeholder">
                          <span>🍽️</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MenuPage;
