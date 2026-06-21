import React, { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_STEPS = ['PENDING', 'PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STATUS_LABELS = {
  PENDING: { label: 'Payment Pending', icon: '⏳' },
  PLACED: { label: 'Order Placed', icon: '📋' },
  PREPARING: { label: 'Preparing', icon: '👨‍🍳' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: '🛵' },
  DELIVERED: { label: 'Delivered', icon: '✅' },
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/orders/history');
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page orders-page">
      <h1 className="page-title">📦 My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start ordering your favourite food!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card glass">
              <div className="order-header">
                <div>
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <span className={`status-chip status-${order.status?.toLowerCase()}`}>
                  {STATUS_LABELS[order.status]?.icon} {order.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Timeline */}
              <div className="timeline">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(order.status);
                  const done = idx <= currentIdx;
                  return (
                    <div key={step} className={`timeline-step ${done ? 'done' : ''} ${idx === currentIdx ? 'active' : ''}`}>
                      <div className="timeline-dot">
                        {done ? STATUS_LABELS[step].icon : '○'}
                      </div>
                      <span className="timeline-label">{STATUS_LABELS[step].label}</span>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`timeline-line ${done && idx < currentIdx ? 'done' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Items */}
              <div className="order-items">
                {order.items?.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span>{item.menuItem?.name} × {item.quantity}</span>
                    <span>₹{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-total-row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{order.paymentStatus === 'PAID' ? 'Total Paid' : 'Total Due'}</strong>
                  <span style={{ fontSize: '0.8em', color: order.paymentStatus === 'PAID' ? 'green' : 'orange' }}>
                    Payment Status: {order.paymentStatus || 'PENDING'}
                  </span>
                </div>
                <strong>₹{parseFloat(order.totalAmount).toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
