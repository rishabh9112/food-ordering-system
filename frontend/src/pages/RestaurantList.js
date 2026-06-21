import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = ['All', 'Veg', 'Non-Veg', 'Fast Food'];

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Debounce search input to limit backend queries while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRestaurants = async (pageNum, currentSearch, currentFilter, isNew = false) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/restaurants', {
        params: {
          page: pageNum,
          size: 10,
          search: currentSearch || undefined,
          category: currentFilter || undefined
        }
      });

      setRestaurants((prev) => {
        if (isNew) {
          return data.content;
        } else {
          // Avoid duplicate elements
          const existingIds = new Set(prev.map(r => r.id));
          const newItems = data.content.filter(r => !existingIds.has(r.id));
          return [...prev, ...newItems];
        }
      });
      setHasMore(!data.last);
    } catch {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  // Reset page and reload when search/filter options change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchRestaurants(0, debouncedSearch, filter, true);
  }, [debouncedSearch, filter]);

  // Load next pages when page state increments
  useEffect(() => {
    if (page > 0) {
      fetchRestaurants(page, debouncedSearch, filter, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Throttled scroll listener to trigger loading more items near screen bottom
  useEffect(() => {
    const handleScroll = throttle(() => {
      const threshold = 150; // trigger loading 150px before bottom
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - threshold
      ) {
        if (!loadingRef.current && hasMoreRef.current) {
          setPage((prev) => prev + 1);
        }
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFirstLoad = page === 0 && loading;

  return (
    <div className="page restaurants-page">
      <div className="page-hero">
        <h1>🍽️ Restaurants Near You</h1>
        <p>Choose from our curated selection of the best restaurants</p>
      </div>

      {/* Search bar */}
      <div className="search-bar-wrapper">
        <input
          id="restaurant-search"
          className="search-input"
          type="text"
          placeholder="🔍 Search restaurants by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Category filter */}
      <div className="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'Veg' && '🥗 '}
            {cat === 'Non-Veg' && '🍗 '}
            {cat === 'Fast Food' && '🍔 '}
            {cat === 'All' && '🍴 '}
            {cat}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {isFirstLoad ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No restaurants found</h3>
          <p>Try a different search term or filter</p>
        </div>
      ) : (
        <>
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="restaurant-card glass"
                onClick={() => navigate(`/restaurants/${restaurant.id}/menu`)}
              >
                <div className="restaurant-img-wrapper">
                  {restaurant.imageUrl ? (
                    <img src={restaurant.imageUrl} alt={restaurant.name} className="restaurant-img" />
                  ) : (
                    <div className="restaurant-img-placeholder">
                      <span>🍽️</span>
                    </div>
                  )}
                  <span className={`status-badge ${restaurant.isActive ? 'open' : 'closed'}`}>
                    {restaurant.isActive ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="restaurant-info">
                  <h3>{restaurant.name}</h3>
                  <p className="restaurant-desc">{restaurant.description || 'Delicious food awaits!'}</p>
                  <div className="restaurant-meta">
                    <span className="meta-item">📍 {restaurant.location || 'Location N/A'}</span>
                  </div>
                  <button className="btn btn-sm btn-primary">View Menu →</button>
                </div>
              </div>
            ))}
          </div>
          {loading && (
            <div className="scroll-loader" style={{ textAlign: 'center', padding: '20px' }}>
              <div className="spinner" style={{ margin: '0 auto', width: '30px', height: '30px' }} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantList;
