import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiUpload, FiTrash2, FiX } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { mediaAPI } from '../../api/endpoints';
import { getImageUrl } from '../../utils/helpers';

export default function MediaManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInput = useRef();

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = () => {
    mediaAPI.list()
      .then((res) => setFiles(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      if (selectedFiles.length === 1) {
        const fd = new FormData();
        fd.append('file', selectedFiles[0]);
        await mediaAPI.upload(fd);
      } else {
        const fd = new FormData();
        for (const f of selectedFiles) fd.append('files', f);
        await mediaAPI.uploadMultiple(fd);
      }
      toast.success('Files uploaded');
      loadFiles();
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    finally { setUploading(false); if (fileInput.current) fileInput.current.value = ''; }
  };

  const handleDelete = async (filePath) => {
    if (!window.confirm('Delete this file?')) return;
    try { await mediaAPI.remove({ file_path: filePath }); toast.success('Deleted'); loadFiles(); }
    catch { toast.error('Failed'); }
  };

  const isImage = (path) => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(path);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Media Library</h1>
        <button className="btn btn-primary" onClick={() => fileInput.current?.click()} disabled={uploading}>
          <FiUpload /> {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
        <input ref={fileInput} type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      <div className="admin-card">
        {files.length === 0 ? (
          <div className="file-upload-area" onClick={() => fileInput.current?.click()}>
            <FiUpload style={{ fontSize: '3rem', color: 'var(--color-text-lighter)', marginBottom: 12 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
              Drop files here or click to upload
            </p>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.8125rem' }}>
              Supports images, documents and other files up to 20MB
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {files.map((file, idx) => {
              const filePath = typeof file === 'string' ? file : file.path || file.url || file.filename;
              const fileName = filePath.split('/').pop();
              return (
                <div key={idx} style={{
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', position: 'relative',
                }}>
                  {isImage(filePath) ? (
                    <img
                      src={getImageUrl(filePath.startsWith('/') ? filePath : `/uploads/media/${filePath}`)}
                      alt={fileName}
                      style={{ width: '100%', height: 120, objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setPreview(filePath.startsWith('/') ? filePath : `/uploads/media/${filePath}`)}
                    />
                  ) : (
                    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-alt)', fontSize: '0.75rem', color: 'var(--color-text-light)', padding: 8, textAlign: 'center', wordBreak: 'break-all' }}>
                      {fileName}
                    </div>
                  )}
                  <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      {fileName}
                    </span>
                    <button onClick={() => handleDelete(filePath)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: '0.875rem' }}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <button onClick={() => setPreview(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10001 }}>
            <FiX />
          </button>
          <img src={getImageUrl(preview)} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
