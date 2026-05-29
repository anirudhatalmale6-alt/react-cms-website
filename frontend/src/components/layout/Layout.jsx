import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CookieBar from '../common/CookieBar';
import ErrorBoundary from '../common/ErrorBoundary';

export default function Layout() {
  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
        <CookieBar />
      </div>
    </ErrorBoundary>
  );
}
