import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const ORDER_STATUSES = ['PENDING', 'PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const EMPTY_RESTAURANT = { name: '', description: '', location: '', imageUrl: '', isActive: true };
const EMPTY_MENU = { name: '', description: '', price: '', category: '', isVeg: false, isAvailable: true };

const AdminDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState(EMPTY_RESTAURANT);
  const [menuForm, setMenuForm] = useState(EMPTY_MENU);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'restaurant' | 'menu', id: number, name: string }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch { /* ignore */ }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    const { data } = await api.get('/admin/restaurants');
    setRestaurants(data);
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data } = await api.get('/admin/orders');
    setOrders(data);
  }, []);

  const fetchMenu = useCallback(async (restaurantId) => {
    const { data } = await api.get(`/admin/restaurants/${restaurantId}/menu`);
    setMenuItems(data);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRestaurants();
    fetchOrders();
  }, [fetchStats, fetchRestaurants, fetchOrders]);

  // ── Restaurant CRUD ────────────────────────────────────────

  const submitRestaurant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRestaurant) {
        await api.put(`/admin/restaurants/${editingRestaurant.id}`, restaurantForm);
        showToast('Restaurant updated!');
      } else {
        await api.post('/admin/restaurants', restaurantForm);
        showToast('Restaurant created!');
      }
      setRestaurantForm(EMPTY_RESTAURANT);
      setEditingRestaurant(null);
      fetchRestaurants();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const editRestaurant = (r) => {
    setEditingRestaurant(r);
    setRestaurantForm({ name: r.name, description: r.description || '', location: r.location || '', imageUrl: r.imageUrl || '', isActive: r.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRestaurant = (r) => {
    setConfirmDelete({ type: 'restaurant', id: r.id, name: r.name });
  };

  const performDeleteRestaurant = async (id) => {
    try {
      await api.delete(`/admin/restaurants/${id}`);
      showToast('✅ Restaurant deleted successfully');
      fetchRestaurants();
      fetchStats();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || err.response?.data?.error || 'Failed to delete restaurant'));
    }
  };

  // ── Menu CRUD ─────────────────────────────────────────────

  const selectRestaurantForMenu = async (r) => {
    setSelectedRestaurant(r);
    await fetchMenu(r.id);
    setTab('menu');
  };

  const submitMenu = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...menuForm, price: parseFloat(menuForm.price) };
      if (editingMenu) {
        await api.put(`/admin/menu/${editingMenu.id}`, payload);
        showToast('Menu item updated!');
      } else {
        await api.post(`/admin/restaurants/${selectedRestaurant.id}/menu`, payload);
        showToast('Menu item added!');
      }
      setMenuForm(EMPTY_MENU);
      setEditingMenu(null);
      fetchMenu(selectedRestaurant.id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const editMenu = (item) => {
    setEditingMenu(item);
    setMenuForm({ name: item.name, description: item.description || '', price: item.price, category: item.category || '', isVeg: item.isVeg, isAvailable: item.isAvailable });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteMenu = (item) => {
    setConfirmDelete({ type: 'menu', id: item.id, name: item.name });
  };

  const performDeleteMenu = async (id) => {
    try {
      await api.delete(`/admin/menu/${id}`);
      showToast('✅ Menu item deleted');
      fetchMenu(selectedRestaurant.id);
      fetchStats();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || err.response?.data?.error || 'Failed to delete menu item'));
    }
  };

  // ── Order Status ──────────────────────────────────────────

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status?status=${status}`);
      fetchOrders();
      fetchStats();
      showToast('Status updated!');
    } catch {
      showToast('Failed to update status');
    }
  };

  return (
    <div className="page admin-page">
      {toast && <div className="toast">{toast}</div>}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h3>⚠️ Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the {confirmDelete.type} <strong>{confirmDelete.name}</strong>?
              {confirmDelete.type === 'restaurant' 
                ? " This will also permanently delete all associated menu items, order history, and active carts." 
                : " This will also permanently remove it from order history and active carts."}
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirmDelete.type === 'restaurant') {
                    performDeleteRestaurant(confirmDelete.id);
                  } else {
                    performDeleteMenu(confirmDelete.id);
                  }
                  setConfirmDelete(null);
                }}
              >
                Yes, Delete
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Manage your food ordering platform</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['dashboard', 'restaurants', 'menu', 'orders'].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'dashboard' && '📊 '}
            {t === 'restaurants' && '🏪 '}
            {t === 'menu' && '🍽️ '}
            {t === 'orders' && '📦 '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === 'dashboard' && stats && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">💰</div>
              <div className="stat-value">₹{parseFloat(stats.totalRevenue || 0).toFixed(2)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">🏪</div>
              <div className="stat-value">{restaurants.length}</div>
              <div className="stat-label">Restaurants</div>
            </div>
          </div>

          {/* Popular Food Items — always shown, with empty state */}
          <div className="top-items glass">
            <h3>🔥 Popular Food Items</h3>
            {!stats.topItems || stats.topItems.length === 0 ? (
              <p className="empty-msg" style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                No orders yet — popular items will appear here
              </p>
            ) : (
              <div className="top-items-list">
                {stats.topItems.map((item, idx) => (
                  <div key={idx} className="top-item-row">
                    <span className="top-rank">#{idx + 1}</span>
                    <div className="top-item-info">
                      <span className="top-name">{item.name}</span>
                      {item.restaurantName && (
                        <span className="top-restaurant">🏪 {item.restaurantName}</span>
                      )}
                    </div>
                    <span className="top-qty">{item.totalQuantity} ordered</span>
                    <div className="top-bar-wrap">
                      <div
                        className="top-bar"
                        style={{
                          width: `${Math.min(100, (item.totalQuantity / (stats.topItems[0]?.totalQuantity || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RESTAURANTS TAB ── */}
      {tab === 'restaurants' && (
        <div className="admin-section">
          <div className="admin-form-card glass">
            <h3>{editingRestaurant ? '✏️ Edit Restaurant' : '➕ Add Restaurant'}</h3>
            <form onSubmit={submitRestaurant} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" required placeholder="Restaurant name"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input className="form-input" placeholder="City, Area"
                    value={restaurantForm.location}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, location: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={2} placeholder="Short description"
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Image URL</label>
                  <input className="form-input" placeholder="https://..."
                    value={restaurantForm.imageUrl}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, imageUrl: e.target.value })} />
                </div>
                <div className="form-group form-check">
                  <label>
                    <input type="checkbox" checked={restaurantForm.isActive}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, isActive: e.target.checked })} />
                    &nbsp; Active
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '...' : editingRestaurant ? 'Update' : 'Create'}
                </button>
                {editingRestaurant && (
                  <button type="button" className="btn btn-ghost"
                    onClick={() => { setEditingRestaurant(null); setRestaurantForm(EMPTY_RESTAURANT); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-table-card glass">
            <h3>🏪 All Restaurants</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Location</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {restaurants.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.location}</td>
                      <td><span className={`admin-status-badge ${r.isActive ? 'open' : 'closed'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-sm btn-ghost" onClick={() => editRestaurant(r)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteRestaurant(r)}>Delete</button>
                          <button className="btn btn-sm btn-primary" onClick={() => selectRestaurantForMenu(r)}>Menu</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MENU TAB ── */}
      {tab === 'menu' && (
        <div className="admin-section">
          {!selectedRestaurant ? (
            <div className="select-restaurant glass">
              <h3>Select a Restaurant to Manage its Menu</h3>
              <div className="restaurant-grid mini">
                {restaurants.map((r) => (
                  <div key={r.id} className="restaurant-mini-card glass" onClick={() => selectRestaurantForMenu(r)}>
                    <strong>{r.name}</strong>
                    <span>{r.location}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="section-header">
                <h3>🍽️ Menu for: <em>{selectedRestaurant.name}</em></h3>
                <button className="btn btn-ghost" onClick={() => { setSelectedRestaurant(null); setMenuItems([]); }}>← Back</button>
              </div>

              <div className="admin-form-card glass">
                <h4>{editingMenu ? '✏️ Edit Item' : '➕ Add Menu Item'}</h4>
                <form onSubmit={submitMenu} className="admin-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input className="form-input" required placeholder="Item name"
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input className="form-input" type="number" min="0" step="0.01" required placeholder="0.00"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <input className="form-input" placeholder="e.g. Starters, Main Course"
                        value={menuForm.category}
                        onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} />
                    </div>
                    <div className="form-group form-check-row">
                      <label><input type="checkbox" checked={menuForm.isVeg}
                        onChange={(e) => setMenuForm({ ...menuForm, isVeg: e.target.checked })} /> &nbsp;Vegetarian</label>
                      <label><input type="checkbox" checked={menuForm.isAvailable}
                        onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })} /> &nbsp;Available</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-input" rows={2}
                      value={menuForm.description}
                      onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? '...' : editingMenu ? 'Update' : 'Add Item'}
                    </button>
                    {editingMenu && (
                      <button type="button" className="btn btn-ghost"
                        onClick={() => { setEditingMenu(null); setMenuForm(EMPTY_MENU); }}>Cancel</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-table-card glass">
                <div className="menu-items-list">
                  {menuItems.length === 0 ? (
                    <p className="empty-msg">No menu items yet</p>
                  ) : menuItems.map((item) => (
                    <div key={item.id} className="menu-admin-row">
                      <div className="menu-admin-info">
                        <span className={`veg-badge ${item.isVeg ? 'veg' : 'nonveg'}`}>{item.isVeg ? '🟢' : '🔴'}</span>
                        <div>
                          <strong>{item.name}</strong>
                          <span className="menu-cat">{item.category}</span>
                        </div>
                      </div>
                      <span className="menu-price">₹{item.price}</span>
                      <span className={`avail-badge ${item.isAvailable ? 'available' : ''}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => editMenu(item)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteMenu(item)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <div className="admin-section">
          <div className="admin-table-card glass">
            <h3>📦 All Orders ({orders.length})</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user?.name}<br/><small>{order.user?.email}</small></td>
                      <td>
                        <ul className="order-items-mini">
                          {order.items?.map((item) => (
                            <li key={item.id}>{item.menuItem?.name} ×{item.quantity}</li>
                          ))}
                        </ul>
                      </td>
                      <td>₹{parseFloat(order.totalAmount).toFixed(2)}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`status-chip status-${order.status?.toLowerCase()}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
