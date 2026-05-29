import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import { seoAPI } from '../../api/endpoints';

export default function SEOSettings() {
  const [form, setForm] = useState({
    google_analytics_id: '', meta_keywords: '', meta_description: '',
    og_title: '', og_description: '', og_image: '',
    twitter_card: 'summary_large_image', twitter_site: '',
    robots_txt: 'User-agent: *\nAllow: /', ads_txt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faviconFile, setFaviconFile] = useState(null);

  useEffect(() => {
    seoAPI.getSettings()
      .then((res) => { if (res.data) setForm((p) => ({ ...p, ...res.data })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'id' && key !== 'favicon_url') fd.append(key, val || '');
      });
      if (faviconFile) fd.append('favicon', faviconFile);
      await seoAPI.updateSettings(fd);
      toast.success('SEO settings saved');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleGenerateSitemap = () => {
    window.open('/sitemap.xml', '_blank');
    toast.info('Sitemap opened in new tab');
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>SEO Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h3>General</h3></div>
          <div className="form-group"><label>Google Analytics ID</label><input type="text" className="form-control" value={form.google_analytics_id} onChange={(e) => setForm((p) => ({ ...p, google_analytics_id: e.target.value }))} placeholder="G-XXXXXXXXXX" /></div>
          <div className="form-group"><label>Default Meta Keywords</label><input type="text" className="form-control" value={form.meta_keywords} onChange={(e) => setForm((p) => ({ ...p, meta_keywords: e.target.value }))} placeholder="keyword1, keyword2, ..." /></div>
          <div className="form-group"><label>Default Meta Description</label><textarea className="form-control" rows="2" value={form.meta_description} onChange={(e) => setForm((p) => ({ ...p, meta_description: e.target.value }))} /></div>
          <div className="form-group"><label>Favicon</label><input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files[0])} /></div>
          {form.favicon_url && !faviconFile && <img src={form.favicon_url} alt="favicon" style={{ height: 32, marginTop: 8 }} />}
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h3>Open Graph / Social</h3></div>
          <div className="form-group"><label>OG Title</label><input type="text" className="form-control" value={form.og_title} onChange={(e) => setForm((p) => ({ ...p, og_title: e.target.value }))} /></div>
          <div className="form-group"><label>OG Description</label><textarea className="form-control" rows="2" value={form.og_description} onChange={(e) => setForm((p) => ({ ...p, og_description: e.target.value }))} /></div>
          <div className="form-group"><label>OG Image URL</label><input type="text" className="form-control" value={form.og_image} onChange={(e) => setForm((p) => ({ ...p, og_image: e.target.value }))} placeholder="/uploads/media/og-image.png" /></div>
          <div className="form-group"><label>Twitter Card Type</label><select className="form-control" value={form.twitter_card} onChange={(e) => setForm((p) => ({ ...p, twitter_card: e.target.value }))}><option value="summary">Summary</option><option value="summary_large_image">Summary Large Image</option></select></div>
          <div className="form-group"><label>Twitter Site Handle</label><input type="text" className="form-control" value={form.twitter_site} onChange={(e) => setForm((p) => ({ ...p, twitter_site: e.target.value }))} placeholder="@yourbrand" /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h3>robots.txt</h3></div>
          <div className="form-group"><textarea className="form-control" rows="8" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }} value={form.robots_txt} onChange={(e) => setForm((p) => ({ ...p, robots_txt: e.target.value }))} /></div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h3>ads.txt</h3></div>
          <div className="form-group"><textarea className="form-control" rows="8" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }} value={form.ads_txt} onChange={(e) => setForm((p) => ({ ...p, ads_txt: e.target.value }))} /></div>
          <button className="btn btn-outline btn-sm" onClick={handleGenerateSitemap} style={{ marginTop: 8 }}>Generate Sitemap</button>
        </div>
      </div>
    </div>
  );
}
