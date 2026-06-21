import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FOODS = ['🍕', '🍔', '🍜', '🌮', '🍱', '🍣', '🥗', '🍟'];

const FEATURES = [
  { icon: '⚡', title: 'Lightning Fast', desc: '30-minute delivery guaranteed' },
  { icon: '🌟', title: 'Top Restaurants', desc: 'Curated selection near you' },
  { icon: '🔒', title: 'Secure & Easy', desc: 'Hassle-free checkout always' },
];

// Static showcase restaurants — shown to logged-out visitors as a preview
// (The real /api/restaurants endpoint requires auth; these give a compelling preview)
const SAMPLE_RESTAURANTS = [
  { id: 1, name: 'Pizza Palace', description: 'Best wood-fired pizza in town. Fresh toppings, crispy crust.', location: 'Downtown', isActive: true },
  { id: 2, name: 'Burger Barn', description: 'Juicy gourmet burgers with hand-cut fries and milkshakes.', location: 'Westside', isActive: true },
  { id: 3, name: 'Chaap Junction', description: 'Best gravy chaap and paneer in the city.', location: 'Govindpuram, Ghaziabad', isActive: true },
  { id: 4, name: 'Sushi World', description: 'Authentic Japanese sushi and ramen, made fresh daily.', location: 'East Market', isActive: true },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* ── Decorative floating food emojis ── */}
      <div className="landing-food-float" aria-hidden="true">
        {FOODS.map((emoji, i) => (
          <div
            key={i}
            className="food-float-card glass"
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            <span>{emoji}</span>
          </div>
        ))}
      </div>

      {/* ── Hero section ── */}
      <div className="landing-hero">
        <div className="landing-badge">🚀 Fast · Fresh · Delicious</div>

        <h1 className="landing-title">
          Delicious food,
          <br />
          <span className="landing-title-accent">delivered fast</span>
        </h1>

        <p className="landing-subtitle">
          Order from the best local restaurants in your city.
          <br />
          Fresh meals, real-time tracking — every single time.
        </p>

        <div className="landing-cta">
          <Link to="/signup" className="btn btn-primary btn-lg" id="landing-signup-btn">
            🍕 Get Started Free
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg" id="landing-login-btn">
            Sign In
          </Link>
        </div>

        {/* Feature cards */}
        <div className="landing-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature-card glass">
              <span className="feature-icon">{f.icon}</span>
              <strong className="feature-title">{f.title}</strong>
              <span className="feature-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Restaurants section ── */}
      <div className="landing-restaurants">
        <div className="landing-section-header">
          <h2 className="landing-section-title">🏪 Popular Restaurants</h2>
          <p className="landing-section-sub">Sign up to order from these top-rated spots</p>
        </div>

        <div className="landing-rest-grid">
          {SAMPLE_RESTAURANTS.map((r) => (
            <div
              key={r.id}
              className="landing-rest-card glass"
              onClick={() => navigate('/signup')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/signup')}
              title="Sign up to view full menu"
            >
              <div className="landing-rest-img">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.name} />
                ) : (
                  <div className="landing-rest-placeholder">🍽️</div>
                )}
                <span className={`status-badge ${r.isActive ? 'open' : 'closed'}`}>
                  {r.isActive ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="landing-rest-info">
                <h3>{r.name}</h3>
                <p>{r.description || 'Delicious food awaits!'}</p>
                <span className="meta-item">📍 {r.location || 'Location N/A'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="landing-view-all">
          <Link to="/signup" className="btn btn-ghost btn-lg">
            View All Restaurants →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
