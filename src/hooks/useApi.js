import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// Generic fetch hook against real backend
export const useFetch = (endpoint, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, ...deps]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Menu from real backend — GET /products?is_available=true
export const useMenu = () => {
  const { data, loading, error } = useFetch('/products?limit=100');
  const products = data?.products || data || [];

  // Group by category_name
  const categories = products.reduce((acc, item) => {
    const cat = item.category_name || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return { data: products, categories, loading, error };
};

// Bookings
export const useBookings = () => useFetch('/bookings');

// Reviews — public GET /settings won't have reviews; return empty for now
export const useReviews = () => ({ data: [], loading: false, error: null });

// Gallery
export const useGallery = () => useFetch('/media');

// Events — no backend yet, static
export const useEvents = () => ({ data: [], loading: false, error: null });

// Staff — no backend yet
export const useStaff = () => ({ data: [], loading: false, error: null });

// Stats
export const useStats = () => useFetch('/dashboard/stats');

// Settings (public)
export const useSettings = () => {
  const { data } = useFetch('/settings');
  const settings = (data?.settings || []).reduce((acc, s) => {
    acc[s.setting_key] = s.setting_value;
    return acc;
  }, {});
  return settings;
};

// Blog posts
export const useBlogPosts = (params = {}) => {
  const qs = Object.entries(params).filter(([,v]) => v).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return useFetch(`/posts${qs ? '?' + qs : ''}`);
};

export const useBlogPost = (slugOrId) => useFetch(slugOrId ? `/posts/${slugOrId}` : null);

// POST hook
export const usePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postData = async (endpoint, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(endpoint, data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error };
};
