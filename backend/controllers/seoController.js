const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { generateSitemap } = require('../utils/sitemap');

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM seo_settings WHERE id = 1');
    if (rows.length === 0) {
      return res.json({
        google_analytics_id: '',
        meta_keywords: '',
        meta_description: '',
        og_title: '',
        og_description: '',
        og_image: '',
        twitter_card: 'summary_large_image',
        twitter_site: '',
        robots_txt: 'User-agent: *\nAllow: /',
        ads_txt: '',
        favicon_url: ''
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('SEO settings get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      google_analytics_id, meta_keywords, meta_description,
      og_title, og_description, og_image,
      twitter_card, twitter_site, robots_txt, ads_txt
    } = req.body;

    let favicon_url = req.body.favicon_url || '';
    if (req.file) {
      favicon_url = '/uploads/seo/' + req.file.filename;
    }

    const [existing] = await db.query('SELECT id FROM seo_settings WHERE id = 1');
    if (existing.length === 0) {
      await db.query(
        `INSERT INTO seo_settings (id, google_analytics_id, meta_keywords, meta_description,
         og_title, og_description, og_image, twitter_card, twitter_site, robots_txt, ads_txt, favicon_url)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [google_analytics_id || '', meta_keywords || '', meta_description || '',
         og_title || '', og_description || '', og_image || '',
         twitter_card || 'summary_large_image', twitter_site || '',
         robots_txt || 'User-agent: *\nAllow: /', ads_txt || '', favicon_url]
      );
    } else {
      if (req.file) {
        await db.query(
          `UPDATE seo_settings SET google_analytics_id = ?, meta_keywords = ?, meta_description = ?,
           og_title = ?, og_description = ?, og_image = ?, twitter_card = ?, twitter_site = ?,
           robots_txt = ?, ads_txt = ?, favicon_url = ? WHERE id = 1`,
          [google_analytics_id || '', meta_keywords || '', meta_description || '',
           og_title || '', og_description || '', og_image || '',
           twitter_card || 'summary_large_image', twitter_site || '',
           robots_txt || 'User-agent: *\nAllow: /', ads_txt || '', favicon_url]
        );
      } else {
        await db.query(
          `UPDATE seo_settings SET google_analytics_id = ?, meta_keywords = ?, meta_description = ?,
           og_title = ?, og_description = ?, og_image = ?, twitter_card = ?, twitter_site = ?,
           robots_txt = ?, ads_txt = ? WHERE id = 1`,
          [google_analytics_id || '', meta_keywords || '', meta_description || '',
           og_title || '', og_description || '', og_image || '',
           twitter_card || 'summary_large_image', twitter_site || '',
           robots_txt || 'User-agent: *\nAllow: /', ads_txt || '']
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM seo_settings WHERE id = 1');
    res.json(rows[0]);
  } catch (err) {
    console.error('SEO settings update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRobotsTxt = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT robots_txt FROM seo_settings WHERE id = 1');
    const content = rows.length > 0 ? rows[0].robots_txt : 'User-agent: *\nAllow: /';
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (err) {
    console.error('robots.txt error:', err);
    res.status(500).send('User-agent: *\nAllow: /');
  }
};

exports.getAdsTxt = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT ads_txt FROM seo_settings WHERE id = 1');
    const content = rows.length > 0 ? rows[0].ads_txt : '';
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (err) {
    console.error('ads.txt error:', err);
    res.status(500).send('');
  }
};

exports.getSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const xml = await generateSitemap(baseUrl);
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
