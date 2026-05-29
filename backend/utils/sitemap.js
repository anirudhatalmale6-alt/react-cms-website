const db = require('../config/db');

async function generateSitemap(baseUrl) {
  const urls = [];

  // Static pages
  urls.push({ loc: baseUrl + '/', changefreq: 'daily', priority: '1.0' });

  // CMS pages
  try {
    const [pages] = await db.query('SELECT slug, updated_at FROM pages WHERE is_published = 1');
    for (const page of pages) {
      urls.push({
        loc: baseUrl + '/' + page.slug,
        lastmod: formatDate(page.updated_at),
        changefreq: 'weekly',
        priority: '0.8'
      });
    }
  } catch (err) {
    console.error('Sitemap: pages error', err.message);
  }

  // Services
  try {
    const [services] = await db.query('SELECT id, updated_at FROM services WHERE is_published = 1');
    for (const svc of services) {
      urls.push({
        loc: baseUrl + '/services/' + svc.id,
        lastmod: formatDate(svc.updated_at),
        changefreq: 'weekly',
        priority: '0.7'
      });
    }
  } catch (err) {
    console.error('Sitemap: services error', err.message);
  }

  // Products
  try {
    const [products] = await db.query('SELECT id, updated_at FROM products WHERE is_published = 1');
    for (const prod of products) {
      urls.push({
        loc: baseUrl + '/products/' + prod.id,
        lastmod: formatDate(prod.updated_at),
        changefreq: 'weekly',
        priority: '0.7'
      });
    }
  } catch (err) {
    console.error('Sitemap: products error', err.message);
  }

  // Projects
  try {
    const [projects] = await db.query('SELECT id, updated_at FROM projects WHERE is_published = 1');
    for (const proj of projects) {
      urls.push({
        loc: baseUrl + '/projects/' + proj.id,
        lastmod: formatDate(proj.updated_at),
        changefreq: 'monthly',
        priority: '0.6'
      });
    }
  } catch (err) {
    console.error('Sitemap: projects error', err.message);
  }

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    if (url.priority) xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>';
  return xml;
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { generateSitemap };
