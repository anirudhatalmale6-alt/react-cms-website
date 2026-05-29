import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { quotationsAPI, servicesAPI } from '../../api/endpoints';

const validationSchema = Yup.object({
  client_name: Yup.string().required('Name is required'),
  client_email: Yup.string().email('Invalid email').required('Email is required'),
  description: Yup.string().required('Please describe your needs'),
});

export default function QuotationForm() {
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    servicesAPI.getPublished().then((r) => setServices(r.data || [])).catch(() => {});
  }, []);

  const formik = useFormik({
    initialValues: {
      client_name: '',
      client_email: '',
      client_company: '',
      phone: '',
      service_id: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const selectedService = services.find((s) => s.id === parseInt(values.service_id));
        await quotationsAPI.create({
          client_name: values.client_name,
          client_email: values.client_email,
          client_company: values.client_company,
          notes: `Phone: ${values.phone || 'N/A'}\nService: ${selectedService?.name || 'General'}\n\n${values.description}`,
          items: [{
            description: selectedService?.name || 'Consultation Request',
            quantity: 1,
            unit_price: 0,
          }],
        });
        setSubmitted(true);
        toast.success('Quotation request submitted successfully!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to submit request');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          backgroundColor: '#dcfce7', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '2rem',
        }}>
          &#10003;
        </div>
        <h3 style={{ marginBottom: 12 }}>Thank You!</h3>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 24 }}>
          Your quotation request has been submitted. We will review your requirements and get back to you shortly.
        </p>
        <button className="btn btn-primary" onClick={() => { setSubmitted(false); formik.resetForm(); }}>
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label htmlFor="client_name">Full Name *</label>
          <input
            id="client_name"
            name="client_name"
            type="text"
            className={`form-control ${formik.touched.client_name && formik.errors.client_name ? 'error' : ''}`}
            value={formik.values.client_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Your full name"
          />
          {formik.touched.client_name && formik.errors.client_name && (
            <div className="form-error">{formik.errors.client_name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="client_email">Email *</label>
          <input
            id="client_email"
            name="client_email"
            type="email"
            className={`form-control ${formik.touched.client_email && formik.errors.client_email ? 'error' : ''}`}
            value={formik.values.client_email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="your@email.com"
          />
          {formik.touched.client_email && formik.errors.client_email && (
            <div className="form-error">{formik.errors.client_email}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label htmlFor="client_company">Company</label>
          <input
            id="client_company"
            name="client_company"
            type="text"
            className="form-control"
            value={formik.values.client_company}
            onChange={formik.handleChange}
            placeholder="Company name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="form-control"
            value={formik.values.phone}
            onChange={formik.handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {services.length > 0 && (
        <div className="form-group">
          <label htmlFor="service_id">Service of Interest</label>
          <select
            id="service_id"
            name="service_id"
            className="form-control"
            value={formik.values.service_id}
            onChange={formik.handleChange}
          >
            <option value="">Select a service (optional)</option>
            {services.map((svc) => (
              <option key={svc.id} value={svc.id}>{svc.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="description">Describe Your Needs *</label>
        <textarea
          id="description"
          name="description"
          className={`form-control ${formik.touched.description && formik.errors.description ? 'error' : ''}`}
          rows="6"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Tell us about your project requirements, budget, timeline, etc."
        />
        {formik.touched.description && formik.errors.description && (
          <div className="form-error">{formik.errors.description}</div>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Request Quotation'}
      </button>
    </form>
  );
}
