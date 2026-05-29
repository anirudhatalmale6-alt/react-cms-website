import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome, FiFileText, FiGrid, FiBox, FiFolder, FiMessageSquare,
  FiHelpCircle, FiImage, FiSliders, FiSettings, FiMail, FiDollarSign,
  FiUsers, FiSearch, FiLogOut, FiMenu, FiX, FiLayers, FiShield
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const navItems = [
  { section: 'Main' },
  { to: '/admin', icon: FiHome, label: 'Dashboard', end: true },
  { section: 'Content' },
  { to: '/admin/pages', icon: FiFileText, label: 'Pages' },
  { to: '/admin/services', icon: FiGrid, label: 'Services' },
  { to: '/admin/products', icon: FiBox, label: 'Products' },
  { to: '/admin/projects', icon: FiFolder, label: 'Projects' },
  { to: '/admin/slider', icon: FiLayers, label: 'Slider' },
  { to: '/admin/faq', icon: FiHelpCircle, label: 'FAQ' },
  { to: '/admin/partners', icon: FiUsers, label: 'Partners' },
  { to: '/admin/media', icon: FiImage, label: 'Media' },
  { section: 'Business' },
  { to: '/admin/quotations', icon: FiDollarSign, label: 'Quotations' },
  { to: '/admin/contact', icon: FiMessageSquare, label: 'Contact' },
  { section: 'Settings' },
  { to: '/admin/theme', icon: FiSliders, label: 'Theme' },
  { to: '/admin/seo', icon: FiSearch, label: 'SEO' },
  { to: '/admin/payments', icon: FiDollarSign, label: 'Payments' },
  { to: '/admin/smtp', icon: FiMail, label: 'SMTP' },
  { to: '/admin/cookiebar', icon: FiShield, label: 'Cookie Bar' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>CMS Admin</h2>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="admin-nav-section">{item.section}</div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon /> {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <NavLink to="/" style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
              View Site
            </NavLink>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-user">
              <span>{user?.name || 'Admin'}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-sm" style={{
              background: 'none', border: '1px solid var(--color-border)',
              color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        <div className="admin-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>

      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
