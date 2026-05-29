import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { contactAPI } from '../../api/endpoints';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  message: Yup.string().required('Message is required'),
});

export default function ContactForm() {
  const [departments, setDepartments] = useState([]);
  const [options, setOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    contactAPI.getDepartments().then((r) => setDepartments(r.data || [])).catch(() => {});
    contactAPI.getOptions().then((r) => setOptions(r.data || [])).catch(() => {});
  }, []);

  const optionsByField = options.reduce((acc, opt) => {
    if (!acc[opt.field_name]) acc[opt.field_name] = [];
    acc[opt.field_name].push(opt);
    return acc;
  }, {});

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      department_id: '',
      subject: '',
      message: '',
      selected_options: [],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      try {
        await contactAPI.submit({
          ...values,
          department_id: values.department_id ? parseInt(values.department_id) : null,
        });
        toast.success('Message sent successfully! We will get back to you soon.');
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to send message');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleOptionToggle = (val) => {
    const current = formik.values.selected_options;
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    formik.setFieldValue('selected_options', next);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            className={`form-control ${formik.touched.name && formik.errors.name ? 'error' : ''}`}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Your name"
          />
          {formik.touched.name && formik.errors.name && (
            <div className="form-error">{formik.errors.name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-control ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="your@email.com"
          />
          {formik.touched.email && formik.errors.email && (
            <div className="form-error">{formik.errors.email}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

        {departments.length > 0 && (
          <div className="form-group">
            <label htmlFor="department_id">Department</label>
            <select
              id="department_id"
              name="department_id"
              className="form-control"
              value={formik.values.department_id}
              onChange={formik.handleChange}
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          className="form-control"
          value={formik.values.subject}
          onChange={formik.handleChange}
          placeholder="What is this about?"
        />
      </div>

      {Object.entries(optionsByField).map(([fieldName, opts]) => (
        <div className="form-group" key={fieldName}>
          <label>{fieldName}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {opts.map((opt) => (
              <label key={opt.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.875rem', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={formik.values.selected_options.includes(opt.option_value)}
                  onChange={() => handleOptionToggle(opt.option_value)}
                />
                {opt.option_value}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="form-group">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          className={`form-control ${formik.touched.message && formik.errors.message ? 'error' : ''}`}
          rows="5"
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Tell us about your needs..."
        />
        {formik.touched.message && formik.errors.message && (
          <div className="form-error">{formik.errors.message}</div>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
