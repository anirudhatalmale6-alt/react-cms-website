import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { servicesAPI } from '../../api/endpoints';
import { getImageUrl, truncate, stripHtml } from '../../utils/helpers';

export default function FeaturedServices() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    servicesAPI.getPublished()
      .then((res) => setServices((res.data || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="section-title">
          <h2>Our Services</h2>
          <p>Professional solutions tailored to your needs</p>
        </div>

        <div className="grid grid-3">
          {services.map((svc) => (
            <Link key={svc.id} to={`/services/${svc.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {svc.images && svc.images.length > 0 ? (
                  <img
                    src={getImageUrl(svc.images[0].image_url)}
                    alt={svc.name}
                    className="card-img"
                  />
                ) : (
                  <div style={{
                    height: 220,
                    backgroundColor: 'var(--color-bg-alt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-lighter)',
                    fontSize: '3rem',
                    fontWeight: 800,
                  }}>
                    {svc.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {svc.category_name && (
                    <span className="badge badge-primary" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
                      {svc.category_name}
                    </span>
                  )}
                  <h3 style={{ fontSize: '1.125rem', marginBottom: 8, color: 'var(--color-secondary)' }}>
                    {svc.name}
                  </h3>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem', flex: 1, marginBottom: 12 }}>
                    {truncate(stripHtml(svc.description), 120)}
                  </p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem',
                  }}>
                    Learn More <FiArrowRight />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/services" className="btn btn-outline">View All Services</Link>
        </div>
      </div>
    </section>
  );
}
