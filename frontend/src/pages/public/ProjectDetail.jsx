import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import Loading from '../../components/common/Loading';
import ImageGallery from '../../components/common/ImageGallery';
import { projectsAPI } from '../../api/endpoints';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getById(id)
      .then((res) => setProject(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!project) {
    return (
      <div className="empty-state" style={{ padding: '80px 20px' }}>
        <h3>Project not found</h3>
        <p>The requested project could not be found.</p>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Projects</Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={project.title} description={project.description?.substring(0, 160)} />

      <div className="page-header">
        <div className="container">
          {project.category_name && (
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{project.category_name}</span>
          )}
          <h1>{project.title}</h1>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <Link to="/projects" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--color-primary)', fontWeight: 500, marginBottom: 24,
            fontSize: '0.9375rem',
          }}>
            <FiArrowLeft /> Back to Projects
          </Link>

          {project.images && project.images.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <ImageGallery images={project.images} />
            </div>
          )}

          {project.description && (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: project.description }} />
          )}

          {project.link_url && (
            <div style={{ marginTop: 32 }}>
              <a
                href={project.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Visit Project <FiExternalLink style={{ marginLeft: 6 }} />
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
