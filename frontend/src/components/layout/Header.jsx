import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { servicesAPI, projectsAPI } from '../../api/endpoints';

export default function Header() {
  const { theme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const headerRef = useRef();

  useEffect(() => {
    servicesAPI.getCategories().then((r) => setServiceCategories(r.data || [])).catch(() => {});
    projectsAPI.getCategories().then((r) => setProjectCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setProjectsOpen(false);
  }, [location]);

  const navLinkClass = ({ isActive }) =>
    `header-nav-link ${isActive ? 'active' : ''}`;

  return (
    <header ref={headerRef} style={{
      position: 'sticky', top: 0, zIndex: 1000,
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 'var(--header-height)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {theme.logo_url ? (
            <img src={theme.logo_url} alt={theme.site_name || 'Logo'} style={{ height: 40, width: 'auto' }} />
          ) : (
            <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {theme.site_name || 'CMS'}
            </span>
          )}
        </Link>

        <nav className={`header-nav ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>

          <div
            className="header-dropdown"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <NavLink to="/services" className={navLinkClass}>
              Services <FiChevronDown style={{ fontSize: '0.75rem', marginLeft: 2 }} />
            </NavLink>
            {servicesOpen && serviceCategories.length > 0 && (
              <div className="header-dropdown-menu">
                <Link to="/services" className="header-dropdown-item">All Services</Link>
                {serviceCategories.map((cat) => (
                  <Link key={cat.id} to={`/services?category=${cat.id}`} className="header-dropdown-item">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="header-dropdown"
            onMouseEnter={() => setProjectsOpen(true)}
            onMouseLeave={() => setProjectsOpen(false)}
          >
            <NavLink to="/projects" className={navLinkClass}>
              Projects <FiChevronDown style={{ fontSize: '0.75rem', marginLeft: 2 }} />
            </NavLink>
            {projectsOpen && projectCategories.length > 0 && (
              <div className="header-dropdown-menu">
                <Link to="/projects" className="header-dropdown-item">All Projects</Link>
                {projectCategories.map((cat) => (
                  <Link key={cat.id} to={`/projects?category=${cat.id}`} className="header-dropdown-item">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          <NavLink to="/quotation" className={navLinkClass}>
            <span className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>Get Quote</span>
          </NavLink>
        </nav>

        <button
          className="header-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <style>{`
        .header-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .header-nav-link {
          padding: 8px 14px;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--color-text);
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: all var(--transition);
          display: flex;
          align-items: center;
        }
        .header-nav-link:hover {
          color: var(--color-primary);
          background-color: rgba(37, 99, 235, 0.05);
        }
        .header-nav-link.active {
          color: var(--color-primary);
          font-weight: 600;
        }
        .header-dropdown {
          position: relative;
        }
        .header-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 200px;
          background-color: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 6px;
          z-index: 100;
        }
        .header-dropdown-item {
          display: block;
          padding: 8px 14px;
          font-size: 0.875rem;
          color: var(--color-text);
          text-decoration: none;
          border-radius: var(--radius-sm);
          transition: all var(--transition);
        }
        .header-dropdown-item:hover {
          background-color: var(--color-bg-alt);
          color: var(--color-primary);
        }
        .header-mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--color-text);
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .header-mobile-toggle { display: block; }
          .header-nav {
            display: none;
            position: absolute;
            top: var(--header-height);
            left: 0; right: 0;
            background-color: var(--color-white);
            flex-direction: column;
            padding: 16px;
            border-bottom: 1px solid var(--color-border);
            box-shadow: var(--shadow-lg);
            align-items: stretch;
          }
          .header-nav.open { display: flex; }
          .header-dropdown-menu {
            position: static;
            box-shadow: none;
            border: none;
            padding-left: 16px;
          }
        }
      `}</style>
    </header>
  );
}
