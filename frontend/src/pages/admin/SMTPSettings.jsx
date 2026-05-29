import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import { settingsAPI } from '../../api/endpoints';

export default function SMTPSettings() {
  const [form, setForm] = useState({
    host: '', port: 587, username: '', password: '',
    from_email: '', from_name: '', encryption: 'tls',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    settingsAPI.getSmtp()
      .then((res) => { if (res.data) setForm((p) => ({ ...p, ...res.data })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.host || !form.port) { toast.error('Host and port required'); return; }
    setSaving(true);
    try { await settingsAPI.updateSmtp(form); toast.success('SMTP settings saved'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!testEmail) { toast.error('Enter a test email'); return; }
    setTesting(true);
    try { await settingsAPI.testSmtp({ test_email: testEmail }); toast.success('Test email sent successfully!'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to send test email'); }
    finally { setTesting(false); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>SMTP Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h3>Server Settings</h3></div>
          <div className="form-group"><label>SMTP Host</label><input type="text" className="form-control" value={form.host} onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))} placeholder="smtp.gmail.com" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Port</label><input type="number" className="form-control" value={form.port} onChange={(e) => setForm((p) => ({ ...p, port: parseInt(e.target.value) || 587 }))} /></div>
            <div className="form-group"><label>Encryption</label><select className="form-control" value={form.encryption} onChange={(e) => setForm((p) => ({ ...p, encryption: e.target.value }))}><option value="tls">TLS</option><option value="ssl">SSL</option><option value="none">None</option></select></div>
          </div>
          <div className="form-group"><label>Username</label><input type="text" className="form-control" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} /></div>
          <div className="form-group"><label>Password</label><input type="password" className="form-control" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} /></div>
        </div>

        <div>
          <div className="admin-card">
            <div className="admin-card-header"><h3>Sender Info</h3></div>
            <div className="form-group"><label>From Email</label><input type="email" className="form-control" value={form.from_email} onChange={(e) => setForm((p) => ({ ...p, from_email: e.target.value }))} placeholder="noreply@example.com" /></div>
            <div className="form-group"><label>From Name</label><input type="text" className="form-control" value={form.from_name} onChange={(e) => setForm((p) => ({ ...p, from_name: e.target.value }))} placeholder="CMS Website" /></div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h3>Test Email</h3></div>
            <div className="form-group"><label>Send Test Email To</label><input type="email" className="form-control" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test@example.com" /></div>
            <button className="btn btn-outline" onClick={handleTest} disabled={testing}>{testing ? 'Sending...' : 'Send Test Email'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
