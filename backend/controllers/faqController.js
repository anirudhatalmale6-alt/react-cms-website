const db = require('../config/db');

// --- Categories ---
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM faq_categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('FAQ categories getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await db.query('INSERT INTO faq_categories (name) VALUES (?)', [name]);
    const [rows] = await db.query('SELECT * FROM faq_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('FAQ category create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE faq_categories SET name = ? WHERE id = ?', [name, req.params.id]);
    const [rows] = await db.query('SELECT * FROM faq_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('FAQ category update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM faq_categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('FAQ category delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- FAQs ---
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, fc.name as category_name
      FROM faqs f
      LEFT JOIN faq_categories fc ON f.category_id = fc.id
      ORDER BY f.sort_order ASC, f.id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('FAQs getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, fc.name as category_name
      FROM faqs f
      LEFT JOIN faq_categories fc ON f.category_id = fc.id
      WHERE f.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'FAQ not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('FAQ getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { question, answer, category_id, sort_order } = req.body;
    const [result] = await db.query(
      'INSERT INTO faqs (question, answer, category_id, sort_order) VALUES (?, ?, ?, ?)',
      [question, answer, category_id || null, sort_order || 0]
    );
    const [rows] = await db.query('SELECT * FROM faqs WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('FAQ create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { question, answer, category_id, sort_order } = req.body;
    await db.query(
      'UPDATE faqs SET question = ?, answer = ?, category_id = ?, sort_order = ? WHERE id = ?',
      [question, answer, category_id || null, sort_order || 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM faqs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'FAQ not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('FAQ update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM faqs WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    console.error('FAQ remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
