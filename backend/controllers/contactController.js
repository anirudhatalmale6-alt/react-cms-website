const db = require('../config/db');
const { sendMail } = require('../config/mail');

// --- Departments ---
exports.getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_departments ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Contact departments getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, email } = req.body;
    const [result] = await db.query(
      'INSERT INTO contact_departments (name, email) VALUES (?, ?)',
      [name, email]
    );
    const [rows] = await db.query('SELECT * FROM contact_departments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Contact department create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, email } = req.body;
    await db.query(
      'UPDATE contact_departments SET name = ?, email = ? WHERE id = ?',
      [name, email, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM contact_departments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Contact department update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM contact_departments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    console.error('Contact department delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Contact Options (multi-option selection fields) ---
exports.getOptions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_options ORDER BY field_name ASC, sort_order ASC');
    res.json(rows);
  } catch (err) {
    console.error('Contact options getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createOption = async (req, res) => {
  try {
    const { field_name, option_value, sort_order } = req.body;
    const [result] = await db.query(
      'INSERT INTO contact_options (field_name, option_value, sort_order) VALUES (?, ?, ?)',
      [field_name, option_value, sort_order || 0]
    );
    const [rows] = await db.query('SELECT * FROM contact_options WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Contact option create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateOption = async (req, res) => {
  try {
    const { field_name, option_value, sort_order } = req.body;
    await db.query(
      'UPDATE contact_options SET field_name = ?, option_value = ?, sort_order = ? WHERE id = ?',
      [field_name, option_value, sort_order || 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM contact_options WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Option not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Contact option update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteOption = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM contact_options WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Option not found' });
    res.json({ message: 'Option deleted' });
  } catch (err) {
    console.error('Contact option delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Submissions ---
exports.getSubmissions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cs.*, cd.name as department_name, cd.email as department_email
      FROM contact_submissions cs
      LEFT JOIN contact_departments cd ON cs.department_id = cd.id
      ORDER BY cs.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Contact submissions getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cs.*, cd.name as department_name, cd.email as department_email
      FROM contact_submissions cs
      LEFT JOIN contact_departments cd ON cs.department_id = cd.id
      WHERE cs.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
    // Mark as read
    await db.query('UPDATE contact_submissions SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Contact submission getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.submitForm = async (req, res) => {
  try {
    const { name, email, phone, department_id, subject, message, selected_options } = req.body;
    const [result] = await db.query(
      `INSERT INTO contact_submissions (name, email, phone, department_id, subject, message, selected_options)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || '', department_id || null, subject || '', message, JSON.stringify(selected_options || [])]
    );
    // Send email notification to department
    if (department_id) {
      const [dept] = await db.query('SELECT * FROM contact_departments WHERE id = ?', [department_id]);
      if (dept.length > 0 && dept[0].email) {
        try {
          await sendMail({
            to: dept[0].email,
            subject: `New Contact Form: ${subject || 'No Subject'}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
              <p><strong>Department:</strong> ${dept[0].name}</p>
              <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
              ${selected_options && selected_options.length > 0 ? `<p><strong>Selected Options:</strong> ${selected_options.join(', ')}</p>` : ''}
            `
          });
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr.message);
        }
      }
    }
    res.status(201).json({ message: 'Form submitted successfully', id: result.insertId });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM contact_submissions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Submission not found' });
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    console.error('Contact submission delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
