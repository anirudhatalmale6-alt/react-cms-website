import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import Loading from '../../components/common/Loading';
import { faqAPI } from '../../api/endpoints';

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      borderBottom: '1px solid var(--color-border)',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 16,
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
          {question}
        </span>
        <FiChevronDown style={{
          fontSize: '1.25rem',
          color: 'var(--color-text-light)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          flexShrink: 0,
        }} />
      </button>
      {open && (
        <div style={{
          paddingBottom: 20,
          color: 'var(--color-text-light)',
          fontSize: '0.9375rem',
          lineHeight: 1.7,
        }}>
          <div dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    Promise.all([faqAPI.getAll(), faqAPI.getCategories()])
      .then(([faqRes, catRes]) => {
        setFaqs(faqRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'all'
    ? faqs
    : faqs.filter((faq) => String(faq.category_id) === activeTab);

  return (
    <>
      <SEOHead title="FAQ" description="Frequently asked questions and answers." />

      <div className="page-header">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {loading ? (
            <Loading />
          ) : (
            <>
              {categories.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                  <button
                    className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`btn btn-sm ${activeTab === String(cat.id) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveTab(String(cat.id))}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <h3>No FAQs found</h3>
                  <p>Check back later.</p>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  {filtered.map((faq) => (
                    <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
