import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Loading from './components/common/Loading';

// Layout
import Layout from './components/layout/Layout';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import ServiceDetail from './pages/public/ServiceDetail';
import Projects from './pages/public/Projects';
import ProjectDetail from './pages/public/ProjectDetail';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import QuotationPage from './pages/public/QuotationPage';
import PaymentResult from './pages/public/PaymentResult';

// Admin pages
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ThemeSettings from './pages/admin/ThemeSettings';
import PageManager from './pages/admin/PageManager';
import ServiceManager from './pages/admin/ServiceManager';
import ProductManager from './pages/admin/ProductManager';
import ProjectManager from './pages/admin/ProjectManager';
import QuotationManager from './pages/admin/QuotationManager';
import PaymentSettings from './pages/admin/PaymentSettings';
import PartnerManager from './pages/admin/PartnerManager';
import ContactManager from './pages/admin/ContactManager';
import FAQManager from './pages/admin/FAQManager';
import SliderManager from './pages/admin/SliderManager';
import CookieBarSettings from './pages/admin/CookieBarSettings';
import SEOSettings from './pages/admin/SEOSettings';
import SMTPSettings from './pages/admin/SMTPSettings';
import MediaManager from './pages/admin/MediaManager';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading text="Checking authentication..." />;
  if (!user) return <Navigate to="/admin/login" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="quotation" element={<QuotationPage />} />
        <Route path="payment/success" element={<PaymentResult />} />
        <Route path="payment/cancel" element={<PaymentResult />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="theme" element={<ThemeSettings />} />
        <Route path="pages" element={<PageManager />} />
        <Route path="services" element={<ServiceManager />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="projects" element={<ProjectManager />} />
        <Route path="quotations" element={<QuotationManager />} />
        <Route path="payments" element={<PaymentSettings />} />
        <Route path="partners" element={<PartnerManager />} />
        <Route path="contact" element={<ContactManager />} />
        <Route path="faq" element={<FAQManager />} />
        <Route path="slider" element={<SliderManager />} />
        <Route path="cookiebar" element={<CookieBarSettings />} />
        <Route path="seo" element={<SEOSettings />} />
        <Route path="smtp" element={<SMTPSettings />} />
        <Route path="media" element={<MediaManager />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={
        <Layout>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: 8, color: 'var(--color-primary)' }}>404</h1>
            <h2 style={{ marginBottom: 16 }}>Page Not Found</h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: 24 }}>
              The page you are looking for does not exist.
            </p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        </Layout>
      } />
    </Routes>
  );
}
