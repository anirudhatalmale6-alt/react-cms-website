const db = require('../config/db');

// --- Cookie Settings ---
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cookie_settings WHERE id = 1');
    if (rows.length === 0) {
      return res.json({
        bar_text: '',
        accept_button_text: 'Accept',
        cancel_button_text: 'Decline',
        is_enabled: false
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Cookie settings get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { bar_text, accept_button_text, cancel_button_text, is_enabled } = req.body;
    const [existing] = await db.query('SELECT id FROM cookie_settings WHERE id = 1');
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO cookie_settings (id, bar_text, accept_button_text, cancel_button_text, is_enabled) VALUES (1, ?, ?, ?, ?)',
        [bar_text || '', accept_button_text || 'Accept', cancel_button_text || 'Decline', is_enabled ? 1 : 0]
      );
    } else {
      await db.query(
        'UPDATE cookie_settings SET bar_text = ?, accept_button_text = ?, cancel_button_text = ?, is_enabled = ? WHERE id = 1',
        [bar_text || '', accept_button_text || 'Accept', cancel_button_text || 'Decline', is_enabled ? 1 : 0]
      );
    }
    const [rows] = await db.query('SELECT * FROM cookie_settings WHERE id = 1');
    res.json(rows[0]);
  } catch (err) {
    console.error('Cookie settings update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Cookie Categories ---
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cookie_categories ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Cookie categories getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, is_required, sort_order } = req.body;
    const [result] = await db.query(
      'INSERT INTO cookie_categories (name, description, is_required, sort_order) VALUES (?, ?, ?, ?)',
      [name, description || '', is_required ? 1 : 0, sort_order || 0]
    );
    const [rows] = await db.query('SELECT * FROM cookie_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Cookie category create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, is_required, sort_order } = req.body;
    await db.query(
      'UPDATE cookie_categories SET name = ?, description = ?, is_required = ?, sort_order = ? WHERE id = ?',
      [name, description || '', is_required ? 1 : 0, sort_order || 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM cookie_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Cookie category update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM cookie_categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Cookie category delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
