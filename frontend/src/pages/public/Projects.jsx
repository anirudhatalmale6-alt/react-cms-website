import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import Loading from '../../components/common/Loading';
import { projectsAPI } from '../../api/endpoints';
import { getImageUrl, truncate, stripHtml } from '../../utils/helpers';

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    Promise.all([
      projectsAPI.getPublished(),
      projectsAPI.getCategories(),
    ])
      .then(([projRes, catRes]) => {
        setProjects(projRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory
    ? projects.filter((p) => String(p.category_id) === activeCategory)
    : projects;

  return (
    <>
      <SEOHead title="Projects" description="Explore our completed projects and portfolio." />

      <div className="page-header">
        <div className="container">
          <h1>Our Projects</h1>
          <p>Explore our portfolio of completed work</p>
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
              <h3>No projects found</h3>
              <p>Check back later for our latest projects.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filtered.map((proj) => (
                <Link key={proj.id} to={`/projects/${proj.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {(proj.featured_image || (proj.images && proj.images.length > 0)) ? (
                      <img
                        src={getImageUrl(proj.featured_image || proj.images[0].image_url)}
                        alt={proj.title}
                        className="card-img"
                      />
                    ) : (
                      <div style={{
                        height: 220, backgroundColor: 'var(--color-bg-alt)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-lighter)', fontSize: '3rem', fontWeight: 800,
                      }}>
                        {proj.title?.charAt(0) || 'P'}
                      </div>
                    )}
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {proj.category_name && (
                        <span className="badge badge-primary" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
                          {proj.category_name}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1.125rem', marginBottom: 8, color: 'var(--color-secondary)' }}>
                        {proj.title}
                      </h3>
                      <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem', flex: 1 }}>
                        {truncate(stripHtml(proj.description), 150)}
                      </p>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem',
                        marginTop: 12,
                      }}>
                        View Project <FiArrowRight />
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
