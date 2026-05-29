const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Pages getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublished = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pages WHERE is_published = 1 ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Pages getPublished error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pages WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Pages getBySlug error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Pages getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, slug, content, meta_title, meta_description, is_published } = req.body;
    const [existing] = await db.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    const [result] = await db.query(
      'INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published) VALUES (?, ?, ?, ?, ?, ?)',
      [title, slug, content || '', meta_title || '', meta_description || '', is_published ? 1 : 0]
    );
    const [rows] = await db.query('SELECT * FROM pages WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Pages create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, slug, content, meta_title, meta_description, is_published } = req.body;
    const [existing] = await db.query('SELECT id FROM pages WHERE slug = ? AND id != ?', [slug, req.params.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    await db.query(
      'UPDATE pages SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, is_published = ? WHERE id = ?',
      [title, slug, content || '', meta_title || '', meta_description || '', is_published ? 1 : 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Pages update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM pages WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ message: 'Page deleted' });
  } catch (err) {
    console.error('Pages remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
