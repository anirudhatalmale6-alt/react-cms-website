import React from 'react';
import SEOHead from '../../components/common/SEOHead';
import QuotationForm from '../../components/forms/QuotationForm';

export default function QuotationPage() {
  return (
    <>
      <SEOHead title="Request a Quote" description="Request a personalized quotation for our services." />

      <div className="page-header">
        <div className="container">
          <h1>Request a Quote</h1>
          <p>Tell us about your project and we will provide a detailed quotation</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="card">
            <div className="card-body" style={{ padding: 32 }}>
              <QuotationForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
