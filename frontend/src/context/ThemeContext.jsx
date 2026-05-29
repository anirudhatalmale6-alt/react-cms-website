import React, { createContext, useContext, useState, useEffect } from 'react';
import { themeAPI } from '../api/endpoints';

const ThemeContext = createContext(null);

const defaults = {
  primary_color: '#2563eb',
  secondary_color: '#1e293b',
  accent_color: '#f59e0b',
  font_family: 'Inter, system-ui, sans-serif',
  logo_url: '',
  favicon_url: '',
  site_name: 'CMS Website',
  header_style: 'default',
  footer_style: 'default',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaults);
  const [loading, setLoading] = useState(true);

  const applyCSS = (t) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', t.primary_color || defaults.primary_color);
    root.style.setProperty('--color-secondary', t.secondary_color || defaults.secondary_color);
    root.style.setProperty('--color-accent', t.accent_color || defaults.accent_color);
    root.style.setProperty('--font-family', t.font_family || defaults.font_family);
  };

  useEffect(() => {
    themeAPI.getAll()
      .then((res) => {
        const raw = res.data;
        const parsed = {};
        if (Array.isArray(raw)) {
          raw.forEach((item) => { parsed[item.key] = item.value; });
        } else if (raw && typeof raw === 'object') {
          Object.assign(parsed, raw);
        }
        const merged = { ...defaults, ...parsed };
        setTheme(merged);
        applyCSS(merged);
        if (merged.favicon_url) {
          let link = document.querySelector("link[rel='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = merged.favicon_url;
        }
      })
      .catch(() => {
        applyCSS(defaults);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = (newTheme) => {
    const merged = { ...theme, ...newTheme };
    setTheme(merged);
    applyCSS(merged);
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeContext;
