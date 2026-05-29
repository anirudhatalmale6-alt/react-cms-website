import React from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import ContactForm from '../../components/forms/ContactForm';
import { useTheme } from '../../context/ThemeContext';

export default function Contact() {
  const { theme } = useTheme();

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with us. We would love to hear from you." />

      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We would love to hear from you</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Send Us a Message</h2>
              <p style={{ color: 'var(--color-text-light)', marginBottom: 32 }}>
                Fill out the form below and we will get back to you as soon as possible.
              </p>
              <ContactForm />
            </div>

            <div>
              <div style={{
                backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)',
                padding: 32, position: 'sticky', top: 100,
              }}>
                <h3 style={{ marginBottom: 24, fontSize: '1.125rem' }}>Contact Information</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {theme.contact_email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-white)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-primary)',
                      }}>
                        <FiMail />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: 2 }}>Email</p>
                        <a href={`mailto:${theme.contact_email}`} style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                          {theme.contact_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {theme.contact_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-white)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-primary)',
                      }}>
                        <FiPhone />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: 2 }}>Phone</p>
                        <a href={`tel:${theme.contact_phone}`} style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                          {theme.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {theme.contact_address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-white)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-primary)', flexShrink: 0,
                      }}>
                        <FiMapPin />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: 2 }}>Address</p>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{theme.contact_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .section .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
