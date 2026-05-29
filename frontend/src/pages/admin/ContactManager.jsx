import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { contactAPI } from '../../api/endpoints';
import { formatDate } from '../../utils/helpers';

export default function ContactManager() {
  const [departments, setDepartments] = useState([]);
  const [options, setOptions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('submissions');
  const [deptModal, setDeptModal] = useState(false);
  const [optModal, setOptModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [editingOpt, setEditingOpt] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', email: '' });
  const [optForm, setOptForm] = useState({ field_name: '', option_value: '', sort_order: 0 });

  useEffect(() => { loadAll(); }, []);

  const loadAll = () => {
    Promise.all([contactAPI.getDepartments(), contactAPI.getOptions(), contactAPI.getSubmissions()])
      .then(([d, o, s]) => { setDepartments(d.data || []); setOptions(o.data || []); setSubmissions(s.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openDeptCreate = () => { setEditingDept(null); setDeptForm({ name: '', email: '' }); setDeptModal(true); };
  const openDeptEdit = (d) => { setEditingDept(d); setDeptForm({ name: d.name, email: d.email }); setDeptModal(true); };
  const saveDept = async () => {
    if (!deptForm.name || !deptForm.email) { toast.error('Name and email required'); return; }
    try {
      if (editingDept) await contactAPI.updateDepartment(editingDept.id, deptForm);
      else await contactAPI.createDepartment(deptForm);
      toast.success('Saved'); setDeptModal(false); loadAll();
    } catch { toast.error('Failed'); }
  };
  const deleteDept = async (id) => { if (!window.confirm('Delete?')) return; try { await contactAPI.deleteDepartment(id); toast.success('Deleted'); loadAll(); } catch { toast.error('Failed'); } };

  const openOptCreate = () => { setEditingOpt(null); setOptForm({ field_name: '', option_value: '', sort_order: 0 }); setOptModal(true); };
  const openOptEdit = (o) => { setEditingOpt(o); setOptForm({ field_name: o.field_name, option_value: o.option_value, sort_order: o.sort_order || 0 }); setOptModal(true); };
  const saveOpt = async () => {
    if (!optForm.field_name || !optForm.option_value) { toast.error('Fields required'); return; }
    try {
      if (editingOpt) await contactAPI.updateOption(editingOpt.id, optForm);
      else await contactAPI.createOption(optForm);
      toast.success('Saved'); setOptModal(false); loadAll();
    } catch { toast.error('Failed'); }
  };
  const deleteOpt = async (id) => { if (!window.confirm('Delete?')) return; try { await contactAPI.deleteOption(id); toast.success('Deleted'); loadAll(); } catch { toast.error('Failed'); } };

  const viewSubmission = async (sub) => {
    try { const res = await contactAPI.getSubmissionById(sub.id); setViewModal(res.data); loadAll(); }
    catch { setViewModal(sub); }
  };
  const deleteSubmission = async (id) => { if (!window.confirm('Delete?')) return; try { await contactAPI.deleteSubmission(id); toast.success('Deleted'); loadAll(); } catch { toast.error('Failed'); } };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header"><h1>Contact Management</h1></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['submissions', 'departments', 'options'].map((t) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'submissions' && (
        <div className="admin-card">
          {submissions.length === 0 ? <div className="empty-state"><h3>No submissions</h3></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Department</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{s.email}</td>
                      <td>{s.subject || '-'}</td>
                      <td>{s.department_name || '-'}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{formatDate(s.created_at)}</td>
                      <td><span className={`badge ${s.is_read ? 'badge-success' : 'badge-warning'}`}>{s.is_read ? 'Read' : 'New'}</span></td>
                      <td><div className="actions"><button className="view" onClick={() => viewSubmission(s)}><FiEye /></button><button className="delete" onClick={() => deleteSubmission(s.id)}><FiTrash2 /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'departments' && (
        <div className="admin-card">
          <div className="admin-card-header"><h3>Departments</h3><button className="btn btn-sm btn-primary" onClick={openDeptCreate}><FiPlus /> Add</button></div>
          {departments.length === 0 ? <p style={{ color: 'var(--color-text-light)' }}>No departments.</p> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.id}><td style={{ fontWeight: 600 }}>{d.name}</td><td>{d.email}</td><td><div className="actions"><button className="edit" onClick={() => openDeptEdit(d)}><FiEdit2 /></button><button className="delete" onClick={() => deleteDept(d.id)}><FiTrash2 /></button></div></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'options' && (
        <div className="admin-card">
          <div className="admin-card-header"><h3>Form Options</h3><button className="btn btn-sm btn-primary" onClick={openOptCreate}><FiPlus /> Add</button></div>
          {options.length === 0 ? <p style={{ color: 'var(--color-text-light)' }}>No options.</p> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Field Name</th><th>Value</th><th>Order</th><th>Actions</th></tr></thead>
                <tbody>
                  {options.map((o) => (
                    <tr key={o.id}><td style={{ fontWeight: 600 }}>{o.field_name}</td><td>{o.option_value}</td><td>{o.sort_order}</td><td><div className="actions"><button className="edit" onClick={() => openOptEdit(o)}><FiEdit2 /></button><button className="delete" onClick={() => deleteOpt(o.id)}><FiTrash2 /></button></div></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Submission Details</h3><button className="modal-close" onClick={() => setViewModal(null)}><FiX /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><strong>Name:</strong> {viewModal.name}</div>
                <div><strong>Email:</strong> {viewModal.email}</div>
                <div><strong>Phone:</strong> {viewModal.phone || '-'}</div>
                <div><strong>Department:</strong> {viewModal.department_name || '-'}</div>
                <div><strong>Subject:</strong> {viewModal.subject || '-'}</div>
                <div><strong>Date:</strong> {formatDate(viewModal.created_at)}</div>
              </div>
              <div style={{ marginBottom: 16 }}><strong>Message:</strong><p style={{ marginTop: 8, whiteSpace: 'pre-wrap', backgroundColor: 'var(--color-bg-alt)', padding: 16, borderRadius: 8 }}>{viewModal.message}</p></div>
              {viewModal.selected_options && (() => { try { const opts = typeof viewModal.selected_options === 'string' ? JSON.parse(viewModal.selected_options) : viewModal.selected_options; return opts.length > 0 ? <div><strong>Selected Options:</strong><div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>{opts.map((o, i) => <span key={i} className="badge badge-primary">{o}</span>)}</div></div> : null; } catch { return null; } })()}
            </div>
          </div>
        </div>
      )}

      {deptModal && (
        <div className="modal-overlay" onClick={() => setDeptModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingDept ? 'Edit' : 'Add'} Department</h3><button className="modal-close" onClick={() => setDeptModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input type="text" className="form-control" value={deptForm.name} onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label>Email</label><input type="email" className="form-control" value={deptForm.email} onChange={(e) => setDeptForm((p) => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => setDeptModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveDept}>Save</button></div>
          </div>
        </div>
      )}

      {optModal && (
        <div className="modal-overlay" onClick={() => setOptModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingOpt ? 'Edit' : 'Add'} Option</h3><button className="modal-close" onClick={() => setOptModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Field Name</label><input type="text" className="form-control" value={optForm.field_name} onChange={(e) => setOptForm((p) => ({ ...p, field_name: e.target.value }))} placeholder="e.g. Budget Range" /></div>
              <div className="form-group"><label>Option Value</label><input type="text" className="form-control" value={optForm.option_value} onChange={(e) => setOptForm((p) => ({ ...p, option_value: e.target.value }))} /></div>
              <div className="form-group"><label>Sort Order</label><input type="number" className="form-control" value={optForm.sort_order} onChange={(e) => setOptForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => setOptModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveOpt}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
