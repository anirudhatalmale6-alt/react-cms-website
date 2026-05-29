const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- Categories ---
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM service_categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Service categories getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO service_categories (name, parent_id, description) VALUES (?, ?, ?)',
      [name, parent_id || null, description || '']
    );
    const [rows] = await db.query('SELECT * FROM service_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Service category create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    await db.query(
      'UPDATE service_categories SET name = ?, parent_id = ?, description = ? WHERE id = ?',
      [name, parent_id || null, description || '', req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM service_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Service category update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM service_categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Service category delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Services ---
exports.getAll = async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT s.*, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      ORDER BY s.created_at DESC
    `);
    for (const svc of services) {
      const [images] = await db.query('SELECT * FROM service_images WHERE service_id = ? ORDER BY sort_order ASC', [svc.id]);
      svc.images = images;
    }
    res.json(services);
  } catch (err) {
    console.error('Services getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublished = async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT s.*, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_published = 1
      ORDER BY s.created_at DESC
    `);
    for (const svc of services) {
      const [images] = await db.query('SELECT * FROM service_images WHERE service_id = ? ORDER BY sort_order ASC', [svc.id]);
      svc.images = images;
    }
    res.json(services);
  } catch (err) {
    console.error('Services getPublished error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    const [images] = await db.query('SELECT * FROM service_images WHERE service_id = ? ORDER BY sort_order ASC', [req.params.id]);
    rows[0].images = images;
    res.json(rows[0]);
  } catch (err) {
    console.error('Services getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, category_id, pricing_info, service_type, is_published } = req.body;
    const [result] = await db.query(
      'INSERT INTO services (name, description, category_id, pricing_info, service_type, is_published) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', category_id || null, pricing_info || '', service_type || '', is_published ? 1 : 0]
    );
    const serviceId = result.insertId;
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filePath = '/uploads/services/' + file.filename;
        await db.query(
          'INSERT INTO service_images (service_id, image_url, sort_order) VALUES (?, ?, ?)',
          [serviceId, filePath, i]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [serviceId]);
    const [images] = await db.query('SELECT * FROM service_images WHERE service_id = ? ORDER BY sort_order ASC', [serviceId]);
    rows[0].images = images;
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Services create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, category_id, pricing_info, service_type, is_published } = req.body;
    await db.query(
      'UPDATE services SET name = ?, description = ?, category_id = ?, pricing_info = ?, service_type = ?, is_published = ? WHERE id = ?',
      [name, description || '', category_id || null, pricing_info || '', service_type || '', is_published ? 1 : 0, req.params.id]
    );
    if (req.files && req.files.length > 0) {
      const [existingImages] = await db.query('SELECT MAX(sort_order) as max_order FROM service_images WHERE service_id = ?', [req.params.id]);
      let startOrder = (existingImages[0].max_order || 0) + 1;
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filePath = '/uploads/services/' + file.filename;
        await db.query(
          'INSERT INTO service_images (service_id, image_url, sort_order) VALUES (?, ?, ?)',
          [req.params.id, filePath, startOrder + i]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    const [images] = await db.query('SELECT * FROM service_images WHERE service_id = ? ORDER BY sort_order ASC', [req.params.id]);
    rows[0].images = images;
    res.json(rows[0]);
  } catch (err) {
    console.error('Services update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [images] = await db.query('SELECT image_url FROM service_images WHERE service_id = ?', [req.params.id]);
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    for (const img of images) {
      const fullPath = path.join(uploadDir, img.image_url.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query('DELETE FROM service_images WHERE service_id = ?', [req.params.id]);
    const [result] = await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('Services remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM service_images WHERE id = ?', [req.params.imageId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const fullPath = path.join(uploadDir, rows[0].image_url.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await db.query('DELETE FROM service_images WHERE id = ?', [req.params.imageId]);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('Service image delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
