import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import Loading from '../../components/common/Loading';
import ImageGallery from '../../components/common/ImageGallery';
import { servicesAPI } from '../../api/endpoints';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesAPI.getById(id)
      .then((res) => setService(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!service) {
    return (
      <div className="empty-state" style={{ padding: '80px 20px' }}>
        <h3>Service not found</h3>
        <p>The requested service could not be found.</p>
        <Link to="/services" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Services</Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={service.name} description={service.description?.substring(0, 160)} />

      <div className="page-header">
        <div className="container">
          {service.category_name && (
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{service.category_name}</span>
          )}
          <h1>{service.name}</h1>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <Link to="/services" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--color-primary)', fontWeight: 500, marginBottom: 24,
            fontSize: '0.9375rem',
          }}>
            <FiArrowLeft /> Back to Services
          </Link>

          {service.images && service.images.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <ImageGallery images={service.images} />
            </div>
          )}

          {service.pricing_info && (
            <div style={{
              backgroundColor: 'var(--color-bg-alt)', padding: 20, borderRadius: 'var(--radius-lg)',
              marginBottom: 32, borderLeft: '4px solid var(--color-primary)',
            }}>
              <h4 style={{ marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Pricing</h4>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {service.pricing_info}
              </p>
            </div>
          )}

          {service.description && (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: service.description }} />
          )}

          <div style={{ marginTop: 48, padding: 32, backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 8 }}>Interested in this service?</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: 20 }}>
              Request a quotation or get in touch with us to learn more.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/quotation" className="btn btn-primary">Request Quote</Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
