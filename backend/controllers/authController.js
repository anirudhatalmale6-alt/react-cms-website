const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM users LIMIT 1');
    if (existing.length > 0) {
      return res.status(403).json({ error: 'Admin already exists. Use login.' });
    }
    const { email, password, name } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'admin']
    );
    const token = jwt.sign(
      { id: result.insertId, email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { id: result.insertId, name, email, role: 'admin' } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkSetup = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM users LIMIT 1');
    res.json({ setupRequired: rows.length === 0 });
  } catch (err) {
    console.error('Check setup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
