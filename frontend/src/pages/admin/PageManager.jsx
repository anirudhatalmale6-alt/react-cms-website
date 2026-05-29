import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { pagesAPI } from '../../api/endpoints';
import { slugify } from '../../utils/helpers';

let ReactQuill = null;

export default function PageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true });
  const [saving, setSaving] = useState(false);
  const [quillLoaded, setQuillLoaded] = useState(false);

  useEffect(() => {
    import('react-quill').then((mod) => {
      ReactQuill = mod.default;
      setQuillLoaded(true);
    });
    loadPages();
  }, []);

  const loadPages = () => {
    pagesAPI.getAll()
      .then((res) => setPages(res.data || []))
      .catch(() => toast.error('Failed to load pages'))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true });
    setModal(true);
  };

  const openEdit = (page) => {
    setEditing(page);
    setForm({
      title: page.title || '',
      slug: page.slug || '',
      content: page.content || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published ? true : false,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await pagesAPI.update(editing.id, { ...form, is_published: form.is_published ? 1 : 0 });
        toast.success('Page updated');
      } else {
        await pagesAPI.create({ ...form, is_published: form.is_published ? 1 : 0 });
        toast.success('Page created');
      }
      setModal(false);
      loadPages();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await pagesAPI.remove(id);
      toast.success('Page deleted');
      loadPages();
    } catch (err) {
      toast.error('Failed to delete page');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Pages</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Page</button>
      </div>

      <div className="admin-card">
        {pages.length === 0 ? (
          <div className="empty-state">
            <h3>No pages yet</h3>
            <p>Create your first page to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td style={{ fontWeight: 600 }}>{page.title}</td>
                    <td style={{ color: 'var(--color-text-light)' }}>/{page.slug}</td>
                    <td>
                      <span className={`badge ${page.is_published ? 'badge-success' : 'badge-secondary'}`}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="edit" onClick={() => openEdit(page)}><FiEdit2 /></button>
                        <button className="delete" onClick={() => handleDelete(page.id)}><FiTrash2 /></button>
                      </div>
                    </td>
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
            <div className="modal-header">
              <h3>{editing ? 'Edit Page' : 'Create Page'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title,
                      slug: !editing ? slugify(title) : prev.slug,
                    }));
                  }}
                />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                {quillLoaded && ReactQuill ? (
                  <ReactQuill
                    theme="snow"
                    value={form.content}
                    onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
                  />
                ) : (
                  <textarea
                    className="form-control"
                    rows="10"
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  />
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.meta_title}
                    onChange={(e) => setForm((prev) => ({ ...prev, meta_title: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Published</label>
                  <label className="toggle" style={{ display: 'block', marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.meta_description}
                  onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm" style={{ background: 'none', border: '1px solid var(--color-border)' }} onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
