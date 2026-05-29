import React from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isSuccess = location.pathname.includes('success');
  const sessionId = searchParams.get('session_id');

  return (
    <>
      <SEOHead title={isSuccess ? 'Payment Successful' : 'Payment Cancelled'} />

      <section className="section">
        <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '2.5rem',
          }}>
            {isSuccess ? '✓' : '✗'}
          </div>

          <h1 style={{ marginBottom: 12 }}>
            {isSuccess ? 'Payment Successful!' : 'Payment Cancelled'}
          </h1>

          <p style={{ color: 'var(--color-text-light)', fontSize: '1.0625rem', marginBottom: 32 }}>
            {isSuccess
              ? 'Your payment has been processed successfully. You will receive a confirmation email shortly.'
              : 'Your payment was cancelled. No charges were made. You can try again or contact us for assistance.'}
          </p>

          {sessionId && isSuccess && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-lighter)', marginBottom: 24 }}>
              Reference: {sessionId}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">Go Home</Link>
            <Link to="/contact" className="btn btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
