const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM partners ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Partners getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Partners getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, url, sort_order } = req.body;
    let logoUrl = '';
    if (req.file) {
      logoUrl = '/uploads/partners/' + req.file.filename;
    }
    const [result] = await db.query(
      'INSERT INTO partners (name, logo_url, url, sort_order) VALUES (?, ?, ?, ?)',
      [name, logoUrl, url || '', sort_order || 0]
    );
    const [rows] = await db.query('SELECT * FROM partners WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Partners create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, url, sort_order } = req.body;
    let logoUrl = null;
    if (req.file) {
      logoUrl = '/uploads/partners/' + req.file.filename;
      // Delete old logo
      const [existing] = await db.query('SELECT logo_url FROM partners WHERE id = ?', [req.params.id]);
      if (existing.length > 0 && existing[0].logo_url) {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const oldPath = path.join(uploadDir, existing[0].logo_url.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }
    if (logoUrl) {
      await db.query(
        'UPDATE partners SET name = ?, logo_url = ?, url = ?, sort_order = ? WHERE id = ?',
        [name, logoUrl, url || '', sort_order || 0, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE partners SET name = ?, url = ?, sort_order = ? WHERE id = ?',
        [name, url || '', sort_order || 0, req.params.id]
      );
    }
    const [rows] = await db.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Partners update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT logo_url FROM partners WHERE id = ?', [req.params.id]);
    if (existing.length > 0 && existing[0].logo_url) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fullPath = path.join(uploadDir, existing[0].logo_url.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    const [result] = await db.query('DELETE FROM partners WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Partner not found' });
    res.json({ message: 'Partner deleted' });
  } catch (err) {
    console.error('Partners remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
