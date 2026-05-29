import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import { themeAPI } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';

const defaultTheme = {
  primary_color: '#2563eb',
  secondary_color: '#1e293b',
  accent_color: '#f59e0b',
  font_family: 'Inter, system-ui, sans-serif',
  site_name: 'CMS Website',
  header_style: 'default',
  footer_style: 'default',
  logo_url: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
};

const fontOptions = [
  'Inter, system-ui, sans-serif',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Poppins, sans-serif',
  'Lato, sans-serif',
  'Nunito, sans-serif',
  'Montserrat, sans-serif',
  'Playfair Display, serif',
];

export default function ThemeSettings() {
  const { updateTheme } = useTheme();
  const [form, setForm] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    themeAPI.getAll()
      .then((res) => {
        const raw = res.data;
        const parsed = {};
        if (Array.isArray(raw)) {
          raw.forEach((item) => { parsed[item.key] = item.value; });
        } else if (raw && typeof raw === 'object') {
          Object.assign(parsed, raw);
        }
        setForm({ ...defaultTheme, ...parsed });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await themeAPI.bulkUpdate(form);
      updateTheme(form);
      toast.success('Theme settings saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Theme Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h3>General</h3></div>

          <div className="form-group">
            <label>Site Name</label>
            <input
              type="text"
              className="form-control"
              value={form.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="text"
              className="form-control"
              value={form.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="/uploads/media/logo.png"
            />
          </div>

          <div className="form-group">
            <label>Font Family</label>
            <select
              className="form-control"
              value={form.font_family}
              onChange={(e) => handleChange('font_family', e.target.value)}
            >
              {fontOptions.map((f) => (
                <option key={f} value={f}>{f.split(',')[0]}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Header Style</label>
            <select
              className="form-control"
              value={form.header_style}
              onChange={(e) => handleChange('header_style', e.target.value)}
            >
              <option value="default">Default</option>
              <option value="centered">Centered</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Footer Style</label>
            <select
              className="form-control"
              value={form.footer_style}
              onChange={(e) => handleChange('footer_style', e.target.value)}
            >
              <option value="default">Default</option>
              <option value="minimal">Minimal</option>
              <option value="centered">Centered</option>
            </select>
          </div>
        </div>

        <div>
          <div className="admin-card">
            <div className="admin-card-header"><h3>Colors</h3></div>

            {[
              { key: 'primary_color', label: 'Primary Color' },
              { key: 'secondary_color', label: 'Secondary Color' },
              { key: 'accent_color', label: 'Accent Color' },
            ].map(({ key, label }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <div className="color-picker-group">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', marginBottom: 8 }}>Preview</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: form.primary_color }} title="Primary" />
                <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: form.secondary_color }} title="Secondary" />
                <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: form.accent_color }} title="Accent" />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h3>Contact Info</h3></div>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={form.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={form.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.contact_address}
                onChange={(e) => handleChange('contact_address', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
