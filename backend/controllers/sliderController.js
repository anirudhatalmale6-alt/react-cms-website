const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sliders ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Sliders getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublished = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sliders WHERE is_published = 1 ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Sliders getPublished error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sliders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Slider not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Slider getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, subtitle, link_url, sort_order, is_published } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = '/uploads/sliders/' + req.file.filename;
    }
    const [result] = await db.query(
      'INSERT INTO sliders (image_url, title, subtitle, link_url, sort_order, is_published) VALUES (?, ?, ?, ?, ?, ?)',
      [imageUrl, title || '', subtitle || '', link_url || '', sort_order || 0, is_published ? 1 : 0]
    );
    const [rows] = await db.query('SELECT * FROM sliders WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Slider create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, subtitle, link_url, sort_order, is_published } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = '/uploads/sliders/' + req.file.filename;
      const [existing] = await db.query('SELECT image_url FROM sliders WHERE id = ?', [req.params.id]);
      if (existing.length > 0 && existing[0].image_url) {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const oldPath = path.join(uploadDir, existing[0].image_url.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }
    if (imageUrl) {
      await db.query(
        'UPDATE sliders SET image_url = ?, title = ?, subtitle = ?, link_url = ?, sort_order = ?, is_published = ? WHERE id = ?',
        [imageUrl, title || '', subtitle || '', link_url || '', sort_order || 0, is_published ? 1 : 0, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE sliders SET title = ?, subtitle = ?, link_url = ?, sort_order = ?, is_published = ? WHERE id = ?',
        [title || '', subtitle || '', link_url || '', sort_order || 0, is_published ? 1 : 0, req.params.id]
      );
    }
    const [rows] = await db.query('SELECT * FROM sliders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Slider not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Slider update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT image_url FROM sliders WHERE id = ?', [req.params.id]);
    if (existing.length > 0 && existing[0].image_url) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fullPath = path.join(uploadDir, existing[0].image_url.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    const [result] = await db.query('DELETE FROM sliders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Slider not found' });
    res.json({ message: 'Slider deleted' });
  } catch (err) {
    console.error('Slider remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT is_published FROM sliders WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Slider not found' });
    const newStatus = existing[0].is_published ? 0 : 1;
    await db.query('UPDATE sliders SET is_published = ? WHERE id = ?', [newStatus, req.params.id]);
    const [rows] = await db.query('SELECT * FROM sliders WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Slider togglePublish error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
