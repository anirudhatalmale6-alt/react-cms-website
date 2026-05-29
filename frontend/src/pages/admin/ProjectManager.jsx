import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { projectsAPI } from '../../api/endpoints';
import { getImageUrl } from '../../utils/helpers';

let ReactQuill = null;

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category_id: '', link_url: '', is_published: true });
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  useEffect(() => {
    import('react-quill').then((mod) => { ReactQuill = mod.default; setQuillLoaded(true); });
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([projectsAPI.getAll(), projectsAPI.getCategories()])
      .then(([projRes, catRes]) => { setProjects(projRes.data || []); setCategories(catRes.data || []); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', category_id: '', link_url: '', is_published: true }); setFiles([]); setCaptions([]); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ title: p.title || '', description: p.description || '', category_id: p.category_id || '', link_url: p.link_url || '', is_published: p.is_published ? true : false }); setFiles([]); setCaptions([]); setModal(true); };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category_id', form.category_id);
      fd.append('link_url', form.link_url);
      fd.append('is_published', form.is_published ? '1' : '0');
      for (let i = 0; i < files.length; i++) {
        fd.append('images', files[i]);
        fd.append('captions', captions[i] || '');
      }
      if (editing) { await projectsAPI.update(editing.id, fd); toast.success('Project updated'); }
      else { await projectsAPI.create(fd); toast.success('Project created'); }
      setModal(false); loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its images?')) return;
    try { await projectsAPI.remove(id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try { await projectsAPI.deleteImage(imageId); toast.success('Image deleted'); loadData(); }
    catch { toast.error('Failed to delete image'); }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    setCaptions(newFiles.map(() => ''));
  };

  const updateCaption = (idx, val) => {
    setCaptions((prev) => { const n = [...prev]; n[idx] = val; return n; });
  };

  const openCatCreate = () => { setEditingCat(null); setCatName(''); setCatDesc(''); setCatModal(true); };
  const openCatEdit = (cat) => { setEditingCat(cat); setCatName(cat.name); setCatDesc(cat.description || ''); setCatModal(true); };
  const handleSaveCat = async () => {
    if (!catName) { toast.error('Name required'); return; }
    try {
      if (editingCat) await projectsAPI.updateCategory(editingCat.id, { name: catName, description: catDesc });
      else await projectsAPI.createCategory({ name: catName, description: catDesc });
      toast.success('Saved'); setCatModal(false); loadData();
    } catch { toast.error('Failed'); }
  };
  const handleDeleteCat = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await projectsAPI.deleteCategory(id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Projects</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={openCatCreate}>Manage Categories</button>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Project</button>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header"><h3>Categories</h3><button className="btn btn-sm btn-outline" onClick={openCatCreate}><FiPlus /> Add</button></div>
        {categories.length === 0 ? <p style={{ color: 'var(--color-text-light)' }}>No categories.</p> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                <span>{cat.name}</span>
                <button onClick={() => openCatEdit(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.75rem' }}><FiEdit2 /></button>
                <button onClick={() => handleDeleteCat(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: '0.75rem' }}><FiTrash2 /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        {projects.length === 0 ? <div className="empty-state"><h3>No projects yet</h3></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>{(p.featured_image || (p.images && p.images[0])) ? <img src={getImageUrl(p.featured_image || p.images[0].image_url)} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 48, height: 48, backgroundColor: 'var(--color-bg-alt)', borderRadius: 6 }} />}</td>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td>{p.category_name || '-'}</td>
                    <td><span className={`badge ${p.is_published ? 'badge-success' : 'badge-secondary'}`}>{p.is_published ? 'Published' : 'Draft'}</span></td>
                    <td><div className="actions"><button className="edit" onClick={() => openEdit(p)}><FiEdit2 /></button><button className="delete" onClick={() => handleDelete(p.id)}><FiTrash2 /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit Project' : 'Create Project'}</h3><button className="modal-close" onClick={() => setModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input type="text" className="form-control" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Category</label><select className="form-control" value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="form-group"><label>External URL</label><input type="url" className="form-control" value={form.link_url} onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))} placeholder="https://..." /></div>
              </div>
              <div className="form-group"><label>Description</label>
                {quillLoaded && ReactQuill ? <ReactQuill theme="snow" value={form.description} onChange={(val) => setForm((p) => ({ ...p, description: val }))} /> : <textarea className="form-control" rows="6" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />}
              </div>
              <div className="form-group"><label>Published</label><label className="toggle" style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={form.is_published} onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))} /><span className="toggle-slider"></span></label></div>
              {editing && editing.images && editing.images.length > 0 && (
                <div className="form-group"><label>Current Images</label><div className="image-grid">{editing.images.map((img) => (<div key={img.id} className="image-item"><img src={getImageUrl(img.image_url)} alt="" /><button className="image-item-delete" onClick={() => handleDeleteImage(img.id)}><FiX /></button>{img.caption && <p style={{ fontSize: '0.7rem', padding: 4 }}>{img.caption}</p>}</div>))}</div></div>
              )}
              <div className="form-group"><label>Upload Images</label><input type="file" multiple accept="image/*" onChange={handleFileChange} /></div>
              {files.length > 0 && (
                <div className="form-group"><label>Captions</label>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', minWidth: 100 }}>{f.name.substring(0, 20)}</span>
                      <input type="text" className="form-control" placeholder="Caption" value={captions[i] || ''} onChange={(e) => updateCaption(i, e.target.value)} />
                    </div>
                  ))}
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

      {catModal && (
        <div className="modal-overlay" onClick={() => setCatModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingCat ? 'Edit Category' : 'Create Category'}</h3><button className="modal-close" onClick={() => setCatModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input type="text" className="form-control" value={catName} onChange={(e) => setCatName(e.target.value)} /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows="2" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => setCatModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveCat}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
