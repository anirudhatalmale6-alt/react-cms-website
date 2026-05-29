const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- Categories ---
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Product categories getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO product_categories (name, parent_id, description) VALUES (?, ?, ?)',
      [name, parent_id || null, description || '']
    );
    const [rows] = await db.query('SELECT * FROM product_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Product category create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    await db.query(
      'UPDATE product_categories SET name = ?, parent_id = ?, description = ? WHERE id = ?',
      [name, parent_id || null, description || '', req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM product_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Product category update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM product_categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Product category delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Products ---
exports.getAll = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY p.created_at DESC
    `);
    for (const prod of products) {
      const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [prod.id]);
      prod.images = images;
    }
    res.json(products);
  } catch (err) {
    console.error('Products getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublished = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.is_published = 1
      ORDER BY p.created_at DESC
    `);
    for (const prod of products) {
      const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [prod.id]);
      prod.images = images;
    }
    res.json(products);
  } catch (err) {
    console.error('Products getPublished error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [req.params.id]);
    rows[0].images = images;
    res.json(rows[0]);
  } catch (err) {
    console.error('Products getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, category_id, price, is_published } = req.body;
    const [result] = await db.query(
      'INSERT INTO products (name, description, category_id, price, is_published) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', category_id || null, price || 0, is_published ? 1 : 0]
    );
    const productId = result.insertId;
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filePath = '/uploads/products/' + file.filename;
        await db.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [productId, filePath, i]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [productId]);
    rows[0].images = images;
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Products create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, category_id, price, is_published } = req.body;
    await db.query(
      'UPDATE products SET name = ?, description = ?, category_id = ?, price = ?, is_published = ? WHERE id = ?',
      [name, description || '', category_id || null, price || 0, is_published ? 1 : 0, req.params.id]
    );
    if (req.files && req.files.length > 0) {
      const [existingImages] = await db.query('SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?', [req.params.id]);
      let startOrder = (existingImages[0].max_order || 0) + 1;
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filePath = '/uploads/products/' + file.filename;
        await db.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [req.params.id, filePath, startOrder + i]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [req.params.id]);
    rows[0].images = images;
    res.json(rows[0]);
  } catch (err) {
    console.error('Products update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [req.params.id]);
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    for (const img of images) {
      const fullPath = path.join(uploadDir, img.image_url.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query('DELETE FROM product_images WHERE product_id = ?', [req.params.id]);
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Products remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_images WHERE id = ?', [req.params.imageId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const fullPath = path.join(uploadDir, rows[0].image_url.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await db.query('DELETE FROM product_images WHERE id = ?', [req.params.imageId]);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('Product image delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
