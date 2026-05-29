const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- Categories ---
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM project_categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Project categories getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO project_categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    const [rows] = await db.query('SELECT * FROM project_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Project category create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.query(
      'UPDATE project_categories SET name = ?, description = ? WHERE id = ?',
      [name, description || '', req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM project_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Project category update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM project_categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Project category delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Projects ---
exports.getAll = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, pc.name as category_name
      FROM projects p
      LEFT JOIN project_categories pc ON p.category_id = pc.id
      ORDER BY p.created_at DESC
    `);
    for (const proj of projects) {
      const [images] = await db.query('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC', [proj.id]);
      proj.images = images;
    }
    res.json(projects);
  } catch (err) {
    console.error('Projects getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublished = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, pc.name as category_name
      FROM projects p
      LEFT JOIN project_categories pc ON p.category_id = pc.id
      WHERE p.is_published = 1
      ORDER BY p.created_at DESC
    `);
    for (const proj of projects) {
      const [images] = await db.query('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC', [proj.id]);
      proj.images = images;
    }
    res.json(projects);
  } catch (err) {
    console.error('Projects getPublished error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, pc.name as category_name
      FROM projects p
      LEFT JOIN project_categories pc ON p.category_id = pc.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const [images] = await db.query('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC', [req.params.id]);
    rows[0].images = images;
    res.json(rows[0]);
  } catch (err) {
    console.error('Projects getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, category_id, featured_image, link_url, is_published } = req.body;
    let featuredImg = featured_image || '';
    if (req.files && req.files.length > 0 && !featuredImg) {
      featuredImg = '/uploads/projects/' + req.files[0].filename;
    }
    const [result] = await db.query(
      'INSERT INTO projects (title, description, category_id, featured_image, link_url, is_published) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || '', category_id || null, featuredImg, link_url || '', is_published ? 1 : 0]
    );
    const projectId = result.insertId;
    if (req.files && req.files.length > 0) {
      const captions = req.body.captions ? (Array.isArray(req.body.captions) ? req.body.captions : [req.body.captions]) : [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filePath = '/uploads/projects/' + file.filename;
        await db.query(
          'INSERT INTO project_images (project_id, image_url, caption, sort_order) VALUES (?, ?, ?, ?)',
          [projectId, filePath, captions[i] || '', i]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    const [images] = await db.query('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC', [projectId]);
    rows[0].images = images;
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Projects create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, category_id, featured_image, link_url, is_published } = req.body;
    let featuredImg = featured_image || '';
    if (req.files && req.files.length > 0 && !featuredImg) {
      featuredImg = '/uploads/projects/' + req.files[0].filename;
    }
    // If no new featured_image provided and no files, keep existing
    if (!featuredImg) {
      const [existing] = await db.query('SELECT featured_image FROM projects WHERE id = ?', [req.params.id]);
      if (existing.length > 0) featuredImg = existing[0].featured_image;
    }
    await db.query(
      'UPDATE projects SET title = ?, description = ?, category_id = ?, featured_image = ?, link_url = ?, is_published = ? WHERE id = ?',
      [title, description || '', category_id || null, featuredImg, link_url || '', is_published ? 1 : 0, req.params.id]
    );
    if (req.files && req.files.length > 0) {
      const [existingImages] = await db.query('SELECT MAX(sort_order) as max_order FROM project_images WHERE project_id = ?', [req.params.id]);
      let startOrder = (existingImages[0].max_order || 0) + 1;
      const captions = req.body.captions ? (Array.isArray(req.body.captions) ? req.body.captions : [req.body.captions]) : [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filePath = '/uploads/projects/' + file.filename;
        await db.query(
          'INSERT INTO project_images (project_id, image_url, caption, sort_order) VALUES (?, ?, ?, ?)',
          [req.params.id, filePath, captions[i] || '', startOrder + i]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const [images] = await db.query('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC', [req.params.id]);
    rows[0].images = images;
    res.json(rows[0]);
  } catch (err) {
    console.error('Projects update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [images] = await db.query('SELECT image_url FROM project_images WHERE project_id = ?', [req.params.id]);
    const [project] = await db.query('SELECT featured_image FROM projects WHERE id = ?', [req.params.id]);
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    for (const img of images) {
      const fullPath = path.join(uploadDir, img.image_url.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    if (project.length > 0 && project[0].featured_image) {
      const featPath = path.join(uploadDir, project[0].featured_image.replace('/uploads/', ''));
      if (fs.existsSync(featPath)) fs.unlinkSync(featPath);
    }
    await db.query('DELETE FROM project_images WHERE project_id = ?', [req.params.id]);
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Projects remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM project_images WHERE id = ?', [req.params.imageId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const fullPath = path.join(uploadDir, rows[0].image_url.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await db.query('DELETE FROM project_images WHERE id = ?', [req.params.imageId]);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('Project image delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
