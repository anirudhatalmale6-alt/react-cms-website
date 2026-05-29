import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { cookiebarAPI } from '../api/endpoints';

const CookieContext = createContext(null);

export function CookieProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [consented, setConsented] = useState(false);
  const [acceptedCategories, setAcceptedCategories] = useState([]);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const stored = Cookies.get('cms_cookie_consent');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsented(true);
        setAcceptedCategories(parsed.categories || []);
      } catch {
        setConsented(false);
      }
    }
    cookiebarAPI.getSettings()
      .then((res) => {
        setSettings(res.data);
        if (!stored && res.data && res.data.enabled !== false) {
          setShowBar(true);
        }
      })
      .catch(() => {});
    cookiebarAPI.getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const acceptAll = () => {
    const allCats = categories.map((c) => c.id);
    const data = { categories: allCats, timestamp: new Date().toISOString() };
    Cookies.set('cms_cookie_consent', JSON.stringify(data), { expires: 365 });
    setConsented(true);
    setAcceptedCategories(allCats);
    setShowBar(false);
  };

  const acceptSelected = (selectedIds) => {
    const data = { categories: selectedIds, timestamp: new Date().toISOString() };
    Cookies.set('cms_cookie_consent', JSON.stringify(data), { expires: 365 });
    setConsented(true);
    setAcceptedCategories(selectedIds);
    setShowBar(false);
  };

  const declineAll = () => {
    const data = { categories: [], timestamp: new Date().toISOString() };
    Cookies.set('cms_cookie_consent', JSON.stringify(data), { expires: 365 });
    setConsented(true);
    setAcceptedCategories([]);
    setShowBar(false);
  };

  return (
    <CookieContext.Provider
      value={{
        settings,
        categories,
        consented,
        acceptedCategories,
        showBar,
        acceptAll,
        acceptSelected,
        declineAll,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieProvider');
  return ctx;
}

export default CookieContext;
