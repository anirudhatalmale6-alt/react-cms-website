import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import Loading from '../../components/common/Loading';
import { servicesAPI } from '../../api/endpoints';
import { getImageUrl, truncate, stripHtml } from '../../utils/helpers';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    Promise.all([
      servicesAPI.getPublished(),
      servicesAPI.getCategories(),
    ])
      .then(([svcRes, catRes]) => {
        setServices(svcRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory
    ? services.filter((s) => String(s.category_id) === activeCategory)
    : services;

  return (
    <>
      <SEOHead title="Services" description="Browse our professional services." />

      <div className="page-header">
        <div className="container">
          <h1>Our Services</h1>
          <p>Professional solutions for every need</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              <button
                className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSearchParams({})}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`btn btn-sm ${activeCategory === String(cat.id) ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSearchParams({ category: cat.id })}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No services found</h3>
              <p>Check back later for our service offerings.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filtered.map((svc) => (
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
                        height: 220, backgroundColor: 'var(--color-bg-alt)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-lighter)', fontSize: '3rem', fontWeight: 800,
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
                        {truncate(stripHtml(svc.description), 150)}
                      </p>
                      {svc.pricing_info && (
                        <p style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>
                          {svc.pricing_info}
                        </p>
                      )}
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
          )}
        </div>
      </section>
    </>
  );
}
