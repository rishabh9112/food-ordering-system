import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // cart item id being updated
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
      updateCartCount(data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
    } catch {
      setCart(null);
      updateCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCart(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Optimistic update: change local qty immediately, sync with server */
  const updateQuantity = async (item, newQty) => {
    // Optimistic: update local state right away
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((ci) =>
        ci.id === item.id ? { ...ci, quantity: newQty } : ci
      ),
    }));
    setUpdatingId(item.id);
    try {
      const { data } = await api.put(`/cart/update/${item.id}`, { quantity: newQty });
      setCart(data); // reconcile with server truth
      updateCartCount(data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
    } catch {
      showToast('Failed to update item');
      fetchCart(); // revert on error
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (itemId) => {
    // Optimistic: remove locally
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((ci) => ci.id !== itemId),
    }));
    setUpdatingId(itemId);
    try {
      const { data } = await api.delete(`/cart/remove/${itemId}`);
      setCart(data);
      updateCartCount(data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
    } catch {
      showToast('Failed to remove item');
      fetchCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Razorpay SDK failed to load. Are you offline?');
        setCheckingOut(false);
        return;
      }

      // 1. Place order (creates order in DB with PENDING status)
      const { data: order } = await api.post('/orders/place');

      // 2. Create Razorpay order
      const { data: rzpOrder } = await api.post('/payments/create-order', {
        orderId: order.id
      });

      // 3. Initialize Razorpay Checkout
      const options = {
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'FoodOrder System',
        description: 'Order Payment',
        order_id: rzpOrder.razorpayOrderId,
        handler: async function (response) {
          try {
            // 4. Verify payment on backend
            await api.post('/payments/verify-signature', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id
            });
            updateCartCount(0);
            setCart(null);
            // Redirect to dedicated success page
            navigate(`/payment-success?orderId=${order.id}`);
          } catch (err) {
            showToast('❌ Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: ''
        },
        theme: {
          color: '#e63946'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showToast('Payment failed. Please try again.');
      });
      rzp.open();

    } catch (err) {
      showToast(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const total =
    cart?.items?.reduce((sum, item) => sum + parseFloat(item.unitPrice) * item.quantity, 0) || 0;

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page cart-page">
      {toast && <div className="toast">{toast}</div>}
      <h1 className="page-title">🛒 Your Cart</h1>

      {!cart || cart.items?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious food first!</p>
          <button className="btn btn-primary" onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items list */}
          <div className="cart-items glass">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                {/* Info — flex:1, no layout shift */}
                <div className="cart-item-info">
                  <span className={`veg-badge ${item.menuItem?.isVeg ? 'veg' : 'nonveg'}`}>
                    {item.menuItem?.isVeg ? '🟢' : '🔴'}
                  </span>
                  <div className="cart-item-text">
                    <h4>{item.menuItem?.name}</h4>
                    <p className="item-price">₹{item.unitPrice} each</p>
                  </div>
                </div>

                {/* Fixed-width quantity controls */}
                <div className="quantity-controls cart-qty-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updatingId === item.id}
                    aria-label="Decrease"
                  >−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                    disabled={updatingId === item.id}
                    aria-label="Increase"
                  >+</button>
                </div>

                {/* Fixed-width total + remove */}
                <div className="cart-item-total">
                  <span>₹{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem(item.id)}
                    disabled={updatingId === item.id}
                    aria-label="Remove item"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="cart-summary glass">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="free-tag">Free</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={checkout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Placing Order...' : '✔ Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
