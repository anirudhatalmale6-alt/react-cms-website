const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM theme_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (err) {
    console.error('Theme getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_value FROM theme_settings WHERE setting_key = ?', [req.params.key]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: req.params.key, value: rows[0].setting_value });
  } catch (err) {
    console.error('Theme get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { key, value } = req.body;
    await db.query(
      'INSERT INTO theme_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, value, value]
    );
    res.json({ key, value });
  } catch (err) {
    console.error('Theme upsert error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.bulkUpdate = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object required' });
    }
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(settings)) {
        await conn.query(
          'INSERT INTO theme_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          [key, value, value]
        );
      }
      await conn.commit();
      res.json({ message: 'Theme settings updated', settings });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Theme bulkUpdate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM theme_settings WHERE setting_key = ?', [req.params.key]);
    res.json({ message: 'Setting deleted' });
  } catch (err) {
    console.error('Theme remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
