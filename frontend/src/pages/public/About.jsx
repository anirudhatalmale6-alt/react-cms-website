import React, { useEffect, useState } from 'react';
import SEOHead from '../../components/common/SEOHead';
import Loading from '../../components/common/Loading';
import { pagesAPI } from '../../api/endpoints';

export default function About() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pagesAPI.getBySlug('about')
      .then((res) => setPage(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title={page?.meta_title || 'About Us'}
        description={page?.meta_description || 'Learn more about us and what we do.'}
      />

      <div className="page-header">
        <div className="container">
          <h1>{page?.title || 'About Us'}</h1>
          <p>Learn more about who we are and what we do</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {loading ? (
            <Loading />
          ) : page?.content ? (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '40px 0' }}>
              <p>Content coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
