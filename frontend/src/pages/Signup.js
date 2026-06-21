import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = (field, value) => {
    const errs = {};
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const val = (f) => (field === f ? value : form[f]);

    if (field === 'name' || !field) {
      if (!val('name')?.trim()) errs.name = 'Full name is required';
      else if (val('name').trim().length < 2) errs.name = 'Name must be at least 2 characters';
    }
    if (field === 'email' || !field) {
      if (!val('email')) errs.email = 'Email is required';
      else if (!emailRegex.test(val('email'))) errs.email = 'Enter a valid email (e.g. user@domain.com)';
    }
    if (field === 'password' || !field) {
      if (!val('password')) errs.password = 'Password is required';
      else if (val('password').length < 6) errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setServerError('');
    if (touched[name]) {
      const errs = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: errs[name] || null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errs = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: errs[name] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    const errs = validate();
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'CUSTOMER' });
      navigate('/login', {
        state: { email: form.email, successMessage: '🎉 Account created! Please sign in.' }
      });
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.message) {
        setErrors(err.response.data);
      } else {
        setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 4) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (p.length < 6) return { label: 'Fair', color: '#f97316', width: '50%' };
    if (p.length < 10) return { label: 'Good', color: '#eab308', width: '75%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  };
  const strength = getPasswordStrength();

  return (
    <div className="auth-split-page">
      {/* Left panel — illustration only, no brand text */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          <img
            src="/noodle-bowl-illustration.svg"
            alt="Noodle bowl illustration"
            className="auth-illustration"
          />
        </div>
      </div>

      {/* Right panel — matches Login theme exactly */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Create Account</h1>
            <p>Join FoodOrder and start your food journey</p>
          </div>

          {serverError && (
            <div className="auth-alert auth-alert-error">
              <span className="auth-alert-icon">⚠️</span>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form-new">
            {/* Full Name */}
            <div className={`auth-field ${errors.name ? 'has-error' : touched.name && !errors.name ? 'is-valid' : ''}`}>
              <label htmlFor="signup-name">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="name"
                />
                {touched.name && !errors.name && <span className="auth-valid-icon">✓</span>}
              </div>
              {errors.name && <p className="auth-field-error"><span>⚠</span> {errors.name}</p>}
            </div>

            {/* Email */}
            <div className={`auth-field ${errors.email ? 'has-error' : touched.email && !errors.email ? 'is-valid' : ''}`}>
              <label htmlFor="signup-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="signup-email"
                  name="email"
                  type="text"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                />
                {touched.email && !errors.email && <span className="auth-valid-icon">✓</span>}
              </div>
              {errors.email && <p className="auth-field-error"><span>⚠</span> {errors.email}</p>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'has-error' : touched.password && !errors.password ? 'is-valid' : ''}`}>
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password strength bar */}
              {form.password && strength && (
                <div className="auth-strength">
                  <div className="auth-strength-bar">
                    <div style={{ width: strength.width, background: strength.color }} className="auth-strength-fill" />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <p className="auth-field-error"><span>⚠</span> {errors.password}</p>}
            </div>

            {/* Delivery Address (optional) */}
            <div className={`auth-field ${touched.address && form.address ? 'is-valid' : ''}`}>
              <label htmlFor="signup-address">
                Delivery Address <span className="auth-optional">(optional)</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">📍</span>
                <input
                  id="signup-address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, City"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="street-address"
                />
                {touched.address && form.address && <span className="auth-valid-icon">✓</span>}
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><span className="btn-spinner-sm" /> Creating account…</>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
