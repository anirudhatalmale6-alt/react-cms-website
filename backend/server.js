require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const subDirs = ['services', 'products', 'projects', 'partners', 'sliders', 'seo', 'media'];
for (const sub of subDirs) {
  const dir = path.join(uploadDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Capture raw body for Stripe webhook verification
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Public SEO files
const seoCtrl = require('./controllers/seoController');
app.get('/robots.txt', seoCtrl.getRobotsTxt);
app.get('/ads.txt', seoCtrl.getAdsTxt);
app.get('/sitemap.xml', seoCtrl.getSitemap);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/theme', require('./routes/theme'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/services', require('./routes/services'));
app.use('/api/products', require('./routes/products'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/faq', require('./routes/faq'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/slider', require('./routes/slider'));
app.use('/api/cookiebar', require('./routes/cookiebar'));
app.use('/api/media', require('./routes/media'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 20MB.' });
  }
  if (err.message && err.message.startsWith('File type not allowed')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CMS Backend running on port ${PORT}`);
  console.log(`Upload directory: ${path.resolve(uploadDir)}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
