import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: 'var(--color-secondary)',
      color: 'rgba(255, 255, 255, 0.7)',
      paddingTop: 64,
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
          paddingBottom: 48,
        }}>
          <div>
            {theme.logo_url ? (
              <img src={theme.logo_url} alt={theme.site_name || 'Logo'} style={{ height: 36, marginBottom: 16, filter: 'brightness(10)' }} />
            ) : (
              <h3 style={{ color: 'white', marginBottom: 16, fontSize: '1.25rem' }}>
                {theme.site_name || 'CMS Website'}
              </h3>
            )}
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 280 }}>
              Providing professional services and solutions. Contact us today to learn more about what we can do for you.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: 16, fontSize: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Services' },
                { to: '/projects', label: 'Projects' },
                { to: '/contact', label: 'Contact' },
                { to: '/faq', label: 'FAQ' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }} onMouseEnter={(e) => e.target.style.color = 'white'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: 16, fontSize: '1rem' }}>Services</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <Link to="/services" style={{
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem',
                }} onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                  View All Services
                </Link>
              </li>
              <li>
                <Link to="/quotation" style={{
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem',
                }} onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                  Request a Quote
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: 16, fontSize: '1rem' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {theme.contact_email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                  <FiMail style={{ flexShrink: 0 }} />
                  <a href={`mailto:${theme.contact_email}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                    {theme.contact_email}
                  </a>
                </div>
              )}
              {theme.contact_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                  <FiPhone style={{ flexShrink: 0 }} />
                  <a href={`tel:${theme.contact_phone}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                    {theme.contact_phone}
                  </a>
                </div>
              )}
              {theme.contact_address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem' }}>
                  <FiMapPin style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{theme.contact_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px 0',
        textAlign: 'center',
        fontSize: '0.8125rem',
      }}>
        <div className="container">
          &copy; {year} {theme.site_name || 'CMS Website'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
