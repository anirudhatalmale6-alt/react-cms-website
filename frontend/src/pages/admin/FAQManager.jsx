import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { faqAPI } from '../../api/endpoints';

let ReactQuill = null;

export default function FAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category_id: '', sort_order: 0 });
  const [catName, setCatName] = useState('');

  useEffect(() => {
    import('react-quill').then((mod) => { ReactQuill = mod.default; setQuillLoaded(true); });
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([faqAPI.getAll(), faqAPI.getCategories()])
      .then(([faqRes, catRes]) => { setFaqs(faqRes.data || []); setCategories(catRes.data || []); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm({ question: '', answer: '', category_id: '', sort_order: 0 }); setModal(true); };
  const openEdit = (f) => { setEditing(f); setForm({ question: f.question, answer: f.answer, category_id: f.category_id || '', sort_order: f.sort_order || 0 }); setModal(true); };

  const handleSave = async () => {
    if (!form.question || !form.answer) { toast.error('Question and answer required'); return; }
    setSaving(true);
    try {
      if (editing) { await faqAPI.update(editing.id, form); toast.success('Updated'); }
      else { await faqAPI.create(form); toast.success('Created'); }
      setModal(false); loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await faqAPI.remove(id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed'); }
  };

  const openCatCreate = () => { setEditingCat(null); setCatName(''); setCatModal(true); };
  const openCatEdit = (c) => { setEditingCat(c); setCatName(c.name); setCatModal(true); };
  const saveCat = async () => {
    if (!catName) { toast.error('Name required'); return; }
    try {
      if (editingCat) await faqAPI.updateCategory(editingCat.id, { name: catName });
      else await faqAPI.createCategory({ name: catName });
      toast.success('Saved'); setCatModal(false); loadData();
    } catch { toast.error('Failed'); }
  };
  const deleteCat = async (id) => { if (!window.confirm('Delete?')) return; try { await faqAPI.deleteCategory(id); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); } };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>FAQ</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={openCatCreate}>Categories</button>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add FAQ</button>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header"><h3>Categories</h3><button className="btn btn-sm btn-outline" onClick={openCatCreate}><FiPlus /> Add</button></div>
        {categories.length === 0 ? <p style={{ color: 'var(--color-text-light)' }}>No categories.</p> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                <span>{c.name}</span>
                <button onClick={() => openCatEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.75rem' }}><FiEdit2 /></button>
                <button onClick={() => deleteCat(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: '0.75rem' }}><FiTrash2 /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        {faqs.length === 0 ? <div className="empty-state"><h3>No FAQs</h3></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Question</th><th>Category</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {faqs.map((f) => {
                  const cat = categories.find((c) => c.id === f.category_id);
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.question}</td>
                      <td>{cat?.name || '-'}</td>
                      <td>{f.sort_order || 0}</td>
                      <td><div className="actions"><button className="edit" onClick={() => openEdit(f)}><FiEdit2 /></button><button className="delete" onClick={() => handleDelete(f.id)}><FiTrash2 /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit FAQ' : 'Add FAQ'}</h3><button className="modal-close" onClick={() => setModal(false)}><FiX /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Question *</label><input type="text" className="form-control" value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} /></div>
              <div className="form-group"><label>Answer *</label>
                {quillLoaded && ReactQuill ? <ReactQuill theme="snow" value={form.answer} onChange={(val) => setForm((p) => ({ ...p, answer: val }))} /> : <textarea className="form-control" rows="4" value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Category</label><select className="form-control" value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="form-group"><label>Sort Order</label><input type="number" className="form-control" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></div>
              </div>
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
            <div className="modal-header"><h3>{editingCat ? 'Edit' : 'Add'} Category</h3><button className="modal-close" onClick={() => setCatModal(false)}><FiX /></button></div>
            <div className="modal-body"><div className="form-group"><label>Name</label><input type="text" className="form-control" value={catName} onChange={(e) => setCatName(e.target.value)} /></div></div>
            <div className="modal-footer"><button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => setCatModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveCat}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
