import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { projectsAPI } from '../../api/endpoints';
import { getImageUrl, truncate, stripHtml } from '../../utils/helpers';

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    projectsAPI.getPublished()
      .then((res) => setProjects((res.data || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="container">
        <div className="section-title">
          <h2>Our Projects</h2>
          <p>See what we have accomplished</p>
        </div>

        <div className="grid grid-3">
          {projects.map((proj) => (
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
                    height: 220,
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-lighter)',
                    fontSize: '3rem',
                    fontWeight: 800,
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
                    {truncate(stripHtml(proj.description), 120)}
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

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/projects" className="btn btn-outline">View All Projects</Link>
        </div>
      </div>
    </section>
  );
}
