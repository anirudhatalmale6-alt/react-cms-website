import React from 'react';

export default function Loading({ text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      color: 'var(--color-text-light)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 16,
      }} />
      <p style={{ fontSize: '0.9375rem' }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
