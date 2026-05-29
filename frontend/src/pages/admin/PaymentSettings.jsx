import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import { paymentsAPI } from '../../api/endpoints';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function PaymentSettings() {
  const [settings, setSettings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeForm, setStripeForm] = useState({ publishable_key: '', secret_key: '', webhook_secret: '', enabled: 'true', test_mode: 'false' });
  const [mspForm, setMspForm] = useState({ api_key: '', environment: 'test', enabled: 'true' });

  useEffect(() => {
    Promise.all([paymentsAPI.getSettings(), paymentsAPI.getTransactions()])
      .then(([settingsRes, txRes]) => {
        const s = settingsRes.data || {};
        if (s.stripe) setStripeForm((p) => ({ ...p, ...s.stripe }));
        if (s.multisafepay) setMspForm((p) => ({ ...p, ...s.multisafepay }));
        setSettings(s);
        setTransactions(txRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveStripe = async () => {
    setSaving(true);
    try {
      await paymentsAPI.updateSettings({ provider: 'stripe', settings: stripeForm });
      toast.success('Stripe settings saved');
    } catch (err) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const saveMsp = async () => {
    setSaving(true);
    try {
      await paymentsAPI.updateSettings({ provider: 'multisafepay', settings: mspForm });
      toast.success('MultiSafePay settings saved');
    } catch (err) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header"><h1>Payment Settings</h1></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h3>Stripe</h3></div>
          <div className="form-group"><label>Publishable Key</label><input type="text" className="form-control" value={stripeForm.publishable_key} onChange={(e) => setStripeForm((p) => ({ ...p, publishable_key: e.target.value }))} placeholder="pk_..." /></div>
          <div className="form-group"><label>Secret Key</label><input type="text" className="form-control" value={stripeForm.secret_key} onChange={(e) => setStripeForm((p) => ({ ...p, secret_key: e.target.value }))} placeholder="sk_..." /></div>
          <div className="form-group"><label>Webhook Secret</label><input type="text" className="form-control" value={stripeForm.webhook_secret} onChange={(e) => setStripeForm((p) => ({ ...p, webhook_secret: e.target.value }))} placeholder="whsec_..." /></div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <div className="form-group"><label>Enabled</label><label className="toggle" style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={stripeForm.enabled === 'true'} onChange={(e) => setStripeForm((p) => ({ ...p, enabled: e.target.checked ? 'true' : 'false' }))} /><span className="toggle-slider"></span></label></div>
            <div className="form-group"><label>Test Mode</label><label className="toggle" style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={stripeForm.test_mode === 'true'} onChange={(e) => setStripeForm((p) => ({ ...p, test_mode: e.target.checked ? 'true' : 'false' }))} /><span className="toggle-slider"></span></label></div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveStripe} disabled={saving}>{saving ? 'Saving...' : 'Save Stripe Settings'}</button>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h3>MultiSafePay</h3></div>
          <div className="form-group"><label>API Key</label><input type="text" className="form-control" value={mspForm.api_key} onChange={(e) => setMspForm((p) => ({ ...p, api_key: e.target.value }))} /></div>
          <div className="form-group"><label>Environment</label><select className="form-control" value={mspForm.environment} onChange={(e) => setMspForm((p) => ({ ...p, environment: e.target.value }))}><option value="test">Test</option><option value="live">Live</option></select></div>
          <div className="form-group"><label>Enabled</label><label className="toggle" style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={mspForm.enabled === 'true'} onChange={(e) => setMspForm((p) => ({ ...p, enabled: e.target.checked ? 'true' : 'false' }))} /><span className="toggle-slider"></span></label></div>
          <button className="btn btn-primary btn-sm" onClick={saveMsp} disabled={saving}>{saving ? 'Saving...' : 'Save MultiSafePay Settings'}</button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><h3>Transaction History</h3></div>
        {transactions.length === 0 ? <p style={{ color: 'var(--color-text-light)' }}>No transactions yet.</p> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Provider</th><th>Amount</th><th>Currency</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontSize: '0.8125rem' }}>{tx.transaction_id?.substring(0, 20)}...</td>
                    <td><span className="badge badge-primary">{tx.provider}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(tx.amount, tx.currency)}</td>
                    <td>{tx.currency}</td>
                    <td><span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>{tx.status}</span></td>
                    <td style={{ fontSize: '0.8125rem' }}>{formatDate(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
