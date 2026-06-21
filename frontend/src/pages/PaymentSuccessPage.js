import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect to order history after 5 seconds
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="payment-success-page">
      <div className="payment-success-card glass">
        {/* Animated checkmark */}
        <div className="success-icon-wrap">
          <svg className="success-checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">
          Your order has been placed and is being prepared 🍽️
        </p>

        {orderId && (
          <div className="success-order-id glass-inner">
            <span className="order-id-label">Order ID</span>
            <span className="order-id-value">#{orderId}</span>
          </div>
        )}

        <div className="success-steps">
          <div className="step-item done">
            <div className="step-dot">✓</div>
            <div className="step-text">
              <strong>Payment Confirmed</strong>
              <span>Your payment was verified securely</span>
            </div>
          </div>
          <div className="step-connector active" />
          <div className="step-item active">
            <div className="step-dot pulsing">🍳</div>
            <div className="step-text">
              <strong>Preparing Your Order</strong>
              <span>The kitchen is working on it</span>
            </div>
          </div>
          <div className="step-connector" />
          <div className="step-item">
            <div className="step-dot">🛵</div>
            <div className="step-text">
              <strong>Out for Delivery</strong>
              <span>On the way to you</span>
            </div>
          </div>
          <div className="step-connector" />
          <div className="step-item">
            <div className="step-dot">🏠</div>
            <div className="step-text">
              <strong>Delivered</strong>
              <span>Enjoy your meal!</span>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/orders')}
          >
            📦 Track My Order
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/restaurants')}
          >
            🍕 Order More
          </button>
        </div>

        <p className="redirect-notice">
          Redirecting to order history in <strong>{countdown}s</strong>…
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
