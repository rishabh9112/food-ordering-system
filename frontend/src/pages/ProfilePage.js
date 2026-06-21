import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfile(data);
        setForm({ name: data.name || '', address: data.address || '' });
      } catch (err) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      setProfile(data);
      setForm({ name: data.name || '', address: data.address || '' });
      updateUser({ name: data.name }); // Update context and localStorage
      setSuccess('✅ Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const roleBadgeClass = profile?.role === 'ADMIN' ? 'role-badge-admin' : 'role-badge-customer';

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="profile-header-info">
          <h1>{profile?.name}</h1>
          <span className={`role-badge ${roleBadgeClass}`}>
            {profile?.role === 'ADMIN' ? '⚙️ Admin' : '🧑 Customer'}
          </span>
        </div>
      </div>

      <div className="profile-layout">
        {/* Edit form */}
        <div className="profile-card glass">
          <h2>✏️ Edit Profile</h2>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                className="form-input profile-input-readonly"
                value={profile?.email || ''}
                readOnly
                tabIndex={-1}
                title="Email cannot be changed"
              />
              <span className="field-hint">📌 Email address cannot be changed</span>
            </div>

            <div className="form-group">
              <label htmlFor="profile-address">Delivery Address</label>
              <input
                id="profile-address"
                name="address"
                type="text"
                className="form-input"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main St, City"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={saving}
            >
              {saving ? <span className="btn-spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account info panel */}
        <div className="profile-info-panel glass">
          <h2>📋 Account Details</h2>
          <div className="profile-info-rows">
            <div className="profile-info-row">
              <span className="info-label">Role</span>
              <span className={`role-badge ${roleBadgeClass}`}>
                {profile?.role === 'ADMIN' ? '⚙️ Admin' : '🧑 Customer'}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{profile?.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{profile?.name}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Address</span>
              <span className="info-value">{profile?.address || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
