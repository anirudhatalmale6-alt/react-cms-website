import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { partnersAPI } from '../../api/endpoints';
import { getImageUrl } from '../../utils/helpers';

export default function PartnerManager() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', url: '' });
  const [file, setFile] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    partnersAPI.getAll()
      .then((res) => setPartners(res.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', url: '' }); setFile(null); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name || '', url: p.url || '' }); setFile(null); setModal(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('url', form.url);
      if (file) fd.append('logo', file);
      if (editing) { await partnersAPI.update(editing.id, fd); toast.success('Updated'); }
      else { await partnersAPI.create(fd); toast.success('Created'); }
      setModal(false); loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await partnersAPI.remove(id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Partners</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Partner</button>
      </div>

      <div className="admin-card">
        {partners.length === 0 ? <div className="empty-state"><h3>No partners yet</h3></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {partners.map((p) => (
              <div key={p.id} style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                padding: 16, textAlign: 'center', position: 'relative',
              }}>
                {(p.logo_url || p.logo) ? (
                  <img src={getImageUrl(p.logo_url || p.logo)} alt={p.name} style={{ height: 60, objectFit: 'contain', margin: '0 auto 12px' }} />
                ) : (
                  <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-lighter)', fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
                    {p.name?.charAt(0)}
                  </div>
                )}
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{p.name}</p>
                {p.url && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', wordBreak: 'break-all' }}>{p.url}</p>}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit Partner' : 'Add Partner'}</h3><button className="modal-close" onClick={() => setModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Name *</label><input type="text" className="form-control" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label>Website URL</label><input type="url" className="form-control" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
              <div className="form-group"><label>Logo</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /></div>
              {editing && (editing.logo_url || editing.logo) && !file && (
                <div style={{ marginTop: 8 }}>
                  <img src={getImageUrl(editing.logo_url || editing.logo)} alt="" style={{ height: 48, objectFit: 'contain' }} />
                </div>
              )}
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
