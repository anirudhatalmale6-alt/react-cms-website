import React, { useState } from 'react';
import { useCookieConsent } from '../../context/CookieContext';

export default function CookieBar() {
  const { settings, categories, showBar, acceptAll, acceptSelected, declineAll } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [selected, setSelected] = useState([]);

  if (!showBar || !settings) return null;

  const handleToggle = (catId) => {
    setSelected((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--color-white)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
      zIndex: 9999,
      padding: '20px 24px',
      borderTop: '3px solid var(--color-primary)',
    }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <p style={{ marginBottom: 16, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
          {settings.text || 'We use cookies to improve your experience. By continuing to use this site, you agree to our use of cookies.'}
        </p>

        {showDetails && categories.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {categories.map((cat) => (
              <label key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                fontSize: '0.875rem', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={selected.includes(cat.id)}
                  onChange={() => handleToggle(cat.id)}
                />
                <span style={{ fontWeight: 600 }}>{cat.name}</span>
                {cat.description && (
                  <span style={{ color: 'var(--color-text-light)' }}>- {cat.description}</span>
                )}
              </label>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary btn-sm" onClick={acceptAll}>
            {settings.accept_label || 'Accept All'}
          </button>
          {categories.length > 0 && (
            <>
              {showDetails ? (
                <button className="btn btn-outline btn-sm" onClick={() => acceptSelected(selected)}>
                  Save Preferences
                </button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setShowDetails(true)}>
                  Customize
                </button>
              )}
            </>
          )}
          <button
            className="btn btn-sm"
            style={{ background: 'none', color: 'var(--color-text-light)', border: '1px solid var(--color-border)' }}
            onClick={declineAll}
          >
            {settings.decline_label || 'Decline'}
          </button>
        </div>
      </div>
    </div>
  );
}
