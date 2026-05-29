import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { sliderAPI } from '../../api/endpoints';
import { getImageUrl } from '../../utils/helpers';

export default function SliderManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', link_url: '', sort_order: 0, is_published: true });
  const [file, setFile] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    sliderAPI.getAll()
      .then((res) => setSlides(res.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm({ title: '', subtitle: '', link_url: '', sort_order: 0, is_published: true }); setFile(null); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ title: s.title || '', subtitle: s.subtitle || '', link_url: s.link_url || '', sort_order: s.sort_order || 0, is_published: s.is_published ? true : false }); setFile(null); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subtitle', form.subtitle);
      fd.append('link_url', form.link_url);
      fd.append('sort_order', form.sort_order);
      fd.append('is_published', form.is_published ? '1' : '0');
      if (file) fd.append('image', file);
      if (editing) { await sliderAPI.update(editing.id, fd); toast.success('Updated'); }
      else { await sliderAPI.create(fd); toast.success('Created'); }
      setModal(false); loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await sliderAPI.remove(id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed'); }
  };

  const handleToggle = async (id) => {
    try { await sliderAPI.togglePublish(id); loadData(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Slider</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Slide</button>
      </div>

      <div className="admin-card">
        {slides.length === 0 ? <div className="empty-state"><h3>No slides</h3></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {slides.map((s) => (
              <div key={s.id} style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                overflow: 'hidden', position: 'relative',
              }}>
                {s.image_url ? (
                  <img src={getImageUrl(s.image_url)} alt={s.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: 160, backgroundColor: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-lighter)' }}>No Image</div>
                )}
                <div style={{ padding: 16 }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{s.title || 'Untitled'}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', marginBottom: 12 }}>{s.subtitle || ''}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}><FiEdit2 /></button>
                    <button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => handleToggle(s.id)}>
                      {s.is_published ? <FiEyeOff /> : <FiEye />} {s.is_published ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}><FiTrash2 /></button>
                  </div>
                </div>
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                }}>
                  <span className={`badge ${s.is_published ? 'badge-success' : 'badge-secondary'}`}>
                    {s.is_published ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit Slide' : 'Add Slide'}</h3><button className="modal-close" onClick={() => setModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input type="text" className="form-control" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div className="form-group"><label>Subtitle</label><input type="text" className="form-control" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} /></div>
              <div className="form-group"><label>Link URL</label><input type="text" className="form-control" value={form.link_url} onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))} placeholder="/services" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Sort Order</label><input type="number" className="form-control" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></div>
                <div className="form-group"><label>Published</label><label className="toggle" style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={form.is_published} onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))} /><span className="toggle-slider"></span></label></div>
              </div>
              <div className="form-group"><label>Image</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /></div>
              {editing && editing.image_url && !file && <img src={getImageUrl(editing.image_url)} alt="" style={{ height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
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
