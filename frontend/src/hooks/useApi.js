import { useState, useEffect, useCallback } from 'react';

export default function useApi(apiCall, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'An error occurred';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, setData };
}
