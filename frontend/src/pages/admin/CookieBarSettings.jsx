import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { cookiebarAPI } from '../../api/endpoints';

export default function CookieBarSettings() {
  const [settings, setSettings] = useState({ enabled: true, text: '', accept_label: 'Accept All', decline_label: 'Decline' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', required: false });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    Promise.all([cookiebarAPI.getSettings(), cookiebarAPI.getCategories()])
      .then(([sRes, cRes]) => {
        if (sRes.data) setSettings((p) => ({ ...p, ...sRes.data }));
        setCategories(cRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    setSaving(true);
    try { await cookiebarAPI.updateSettings(settings); toast.success('Saved'); }
    catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const openCatCreate = () => { setEditingCat(null); setCatForm({ name: '', description: '', required: false }); setCatModal(true); };
  const openCatEdit = (c) => { setEditingCat(c); setCatForm({ name: c.name, description: c.description || '', required: c.required || false }); setCatModal(true); };
  const saveCat = async () => {
    if (!catForm.name) { toast.error('Name required'); return; }
    try {
      if (editingCat) await cookiebarAPI.updateCategory(editingCat.id, catForm);
      else await cookiebarAPI.createCategory(catForm);
      toast.success('Saved'); setCatModal(false); loadData();
    } catch { toast.error('Failed'); }
  };
  const deleteCat = async (id) => { if (!window.confirm('Delete?')) return; try { await cookiebarAPI.deleteCategory(id); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); } };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Cookie Bar Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h3>General</h3></div>
          <div className="form-group">
            <label>Enabled</label>
            <label className="toggle" style={{ display: 'block', marginTop: 8 }}>
              <input type="checkbox" checked={settings.enabled !== false} onChange={(e) => setSettings((p) => ({ ...p, enabled: e.target.checked }))} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="form-group"><label>Cookie Bar Text</label><textarea className="form-control" rows="3" value={settings.text || ''} onChange={(e) => setSettings((p) => ({ ...p, text: e.target.value }))} placeholder="We use cookies to improve your experience..." /></div>
          <div className="form-group"><label>Accept Button Label</label><input type="text" className="form-control" value={settings.accept_label || ''} onChange={(e) => setSettings((p) => ({ ...p, accept_label: e.target.value }))} /></div>
          <div className="form-group"><label>Decline Button Label</label><input type="text" className="form-control" value={settings.decline_label || ''} onChange={(e) => setSettings((p) => ({ ...p, decline_label: e.target.value }))} /></div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h3>Cookie Categories</h3><button className="btn btn-sm btn-outline" onClick={openCatCreate}><FiPlus /> Add</button></div>
          {categories.length === 0 ? <p style={{ color: 'var(--color-text-light)' }}>No categories. Add categories that users can toggle on/off.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name} {c.required ? '(Required)' : ''}</p>
                    {c.description && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{c.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openCatEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}><FiEdit2 size={14} /></button>
                    <button onClick={() => deleteCat(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}><FiTrash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {catModal && (
        <div className="modal-overlay" onClick={() => setCatModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingCat ? 'Edit' : 'Add'} Category</h3><button className="modal-close" onClick={() => setCatModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input type="text" className="form-control" value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Analytics" /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows="2" value={catForm.description} onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} placeholder="Explain what these cookies do" /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => setCatModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveCat}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
