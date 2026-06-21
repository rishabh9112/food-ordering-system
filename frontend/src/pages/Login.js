import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!process.env.REACT_APP_API_URL) {
      setServerError('Backend URL is not configured.');
    }
  }, []);

  const validate = (field, value) => {
    const errs = {};
    if (field === 'email' || !field) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!form.email && !value) errs.email = 'Email is required';
      else if (!emailRegex.test(field === 'email' ? value : form.email))
        errs.email = 'Enter a valid email (e.g. user@domain.com)';
    }
    if (field === 'password' || !field) {
      const pwd = field === 'password' ? value : form.password;
      if (!pwd) errs.password = 'Password is required';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setServerError('');
    setSuccessMessage('');
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
    setTouched({ email: true, password: true });
    const errs = validate();
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(data.role === 'ADMIN' ? '/admin' : '/restaurants');
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.message) {
        setErrors(err.response.data);
      } else {
        setServerError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* Left panel — illustration only */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          <img
            src="/noodle-bowl-illustration.svg"
            alt="Noodle bowl illustration"
            className="auth-illustration"
          />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue ordering your favorites</p>
          </div>

          {successMessage && (
            <div className="auth-alert auth-alert-success">
              <span className="auth-alert-icon">✅</span>
              {successMessage}
            </div>
          )}
          {serverError && (
            <div className="auth-alert auth-alert-error">
              <span className="auth-alert-icon">⚠️</span>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form-new">
            {/* Email */}
            <div className={`auth-field ${errors.email ? 'has-error' : touched.email && !errors.email ? 'is-valid' : ''}`}>
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="login-email"
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
              {errors.email && (
                <p className="auth-field-error">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'has-error' : touched.password && !errors.password ? 'is-valid' : ''}`}>
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="auth-field-error">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><span className="btn-spinner-sm" /> Signing in…</>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <p className="auth-switch-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-switch-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
