import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiDownload, FiMail, FiLink, FiEye } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { quotationsAPI, paymentsAPI } from '../../api/endpoints';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function QuotationManager() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_name: '', client_email: '', client_company: '', notes: '', valid_until: '', status: 'draft',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    quotationsAPI.getAll()
      .then((res) => setQuotations(res.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ client_name: '', client_email: '', client_company: '', notes: '', valid_until: '', status: 'draft', items: [{ description: '', quantity: 1, unit_price: 0 }] });
    setModal(true);
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      client_name: q.client_name || '', client_email: q.client_email || '', client_company: q.client_company || '',
      notes: q.notes || '', valid_until: q.valid_until ? q.valid_until.substring(0, 10) : '', status: q.status || 'draft',
      items: (q.items && q.items.length > 0) ? q.items.map((i) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price })) : [{ description: '', quantity: 1, unit_price: 0 }],
    });
    setModal(true);
  };

  const addItem = () => setForm((p) => ({ ...p, items: [...p.items, { description: '', quantity: 1, unit_price: 0 }] }));
  const removeItem = (idx) => setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, key, val) => setForm((p) => {
    const items = [...p.items]; items[idx] = { ...items[idx], [key]: val }; return { ...p, items };
  });

  const handleSave = async () => {
    if (!form.client_name) { toast.error('Client name required'); return; }
    if (form.items.length === 0) { toast.error('At least one item required'); return; }
    setSaving(true);
    try {
      if (editing) { await quotationsAPI.update(editing.id, form); toast.success('Updated'); }
      else { await quotationsAPI.create(form); toast.success('Created'); }
      setModal(false); loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await quotationsAPI.remove(id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed'); }
  };

  const handlePdf = async (id) => {
    try {
      const res = await quotationsAPI.getPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `quotation-${id}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch { toast.error('Failed to generate PDF'); }
  };

  const handleSendEmail = async (id) => {
    if (!window.confirm('Send quotation PDF to client email?')) return;
    try { await quotationsAPI.sendEmail(id, {}); toast.success('Email sent'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleCreatePaymentLink = async (q) => {
    const amount = q.total || q.subtotal || 0;
    if (amount <= 0) { toast.error('Quotation total must be greater than 0'); return; }
    try {
      const res = await paymentsAPI.createStripeLink({ amount, description: `Quotation ${q.quotation_number}`, quotation_id: q.id });
      const paymentUrl = res.data.url;
      await quotationsAPI.sendOffer(q.id, { payment_link: paymentUrl });
      toast.success('Payment link created and offer sent');
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create payment link'); }
  };

  const getStatusBadge = (status) => {
    const map = { draft: 'badge-secondary', sent: 'badge-primary', offered: 'badge-warning', paid: 'badge-success', cancelled: 'badge-error' };
    return map[status] || 'badge-secondary';
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quotations</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Create Quotation</button>
      </div>

      <div className="admin-card">
        {quotations.length === 0 ? <div className="empty-state"><h3>No quotations</h3></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Client</th><th>Email</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{q.quotation_number}</td>
                    <td>{q.client_name}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{q.client_email || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(q.total)}</td>
                    <td><span className={`badge ${getStatusBadge(q.status)}`}>{q.status}</span></td>
                    <td style={{ fontSize: '0.8125rem' }}>{formatDate(q.created_at)}</td>
                    <td>
                      <div className="actions">
                        <button className="view" title="View" onClick={() => setViewModal(q)}><FiEye /></button>
                        <button className="edit" title="Edit" onClick={() => openEdit(q)}><FiEdit2 /></button>
                        <button title="Download PDF" onClick={() => handlePdf(q.id)}><FiDownload /></button>
                        <button title="Send Email" onClick={() => handleSendEmail(q.id)}><FiMail /></button>
                        <button title="Create Payment Link" onClick={() => handleCreatePaymentLink(q)}><FiLink /></button>
                        <button className="delete" onClick={() => handleDelete(q.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Quotation {viewModal.quotation_number}</h3><button className="modal-close" onClick={() => setViewModal(null)}><FiX /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><strong>Client:</strong> {viewModal.client_name}</div>
                <div><strong>Email:</strong> {viewModal.client_email || '-'}</div>
                <div><strong>Company:</strong> {viewModal.client_company || '-'}</div>
                <div><strong>Status:</strong> <span className={`badge ${getStatusBadge(viewModal.status)}`}>{viewModal.status}</span></div>
              </div>
              {viewModal.notes && <div style={{ marginBottom: 16 }}><strong>Notes:</strong><p style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{viewModal.notes}</p></div>}
              <table style={{ width: '100%' }}>
                <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {(viewModal.items || []).map((item, i) => (
                    <tr key={i}><td>{item.description}</td><td>{item.quantity}</td><td>{formatCurrency(item.unit_price)}</td><td>{formatCurrency(item.total)}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td><td style={{ fontWeight: 700 }}>{formatCurrency(viewModal.total)}</td></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit Quotation' : 'Create Quotation'}</h3><button className="modal-close" onClick={() => setModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Client Name *</label><input type="text" className="form-control" value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} /></div>
                <div className="form-group"><label>Client Email</label><input type="email" className="form-control" value={form.client_email} onChange={(e) => setForm((p) => ({ ...p, client_email: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Company</label><input type="text" className="form-control" value={form.client_company} onChange={(e) => setForm((p) => ({ ...p, client_company: e.target.value }))} /></div>
                <div className="form-group"><label>Valid Until</label><input type="date" className="form-control" value={form.valid_until} onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))} /></div>
                <div className="form-group"><label>Status</label><select className="form-control" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><option value="draft">Draft</option><option value="sent">Sent</option><option value="offered">Offered</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><label style={{ fontWeight: 600 }}>Items</label><button className="btn btn-sm btn-outline" onClick={addItem}><FiPlus /> Add Item</button></div>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 40px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input type="text" className="form-control" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                    <input type="number" className="form-control" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} min="0" />
                    <input type="number" className="form-control" placeholder="Price" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', e.target.value)} min="0" step="0.01" />
                    {form.items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}><FiTrash2 /></button>}
                  </div>
                ))}
                <p style={{ textAlign: 'right', fontWeight: 700, marginTop: 8 }}>
                  Total: {formatCurrency(form.items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0), 0))}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
