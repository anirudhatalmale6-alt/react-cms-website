const db = require('../config/db');
const { getTransporter } = require('../config/mail');

// --- SMTP Settings ---
exports.getSmtp = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM smtp_settings WHERE id = 1');
    if (rows.length === 0) {
      return res.json({
        host: '', port: 587, username: '', password: '',
        from_email: '', from_name: '', encryption: 'tls'
      });
    }
    // Mask password
    const settings = { ...rows[0] };
    if (settings.password) {
      settings.password = '••••••';
    }
    res.json(settings);
  } catch (err) {
    console.error('SMTP settings get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSmtp = async (req, res) => {
  try {
    const { host, port, username, password, from_email, from_name, encryption } = req.body;
    const [existing] = await db.query('SELECT id, password as existing_pass FROM smtp_settings WHERE id = 1');
    // Keep existing password if masked value sent
    const actualPassword = (password === '••••••' && existing.length > 0)
      ? existing[0].existing_pass
      : password;

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO smtp_settings (id, host, port, username, password, from_email, from_name, encryption)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
        [host || '', port || 587, username || '', actualPassword || '', from_email || '', from_name || '', encryption || 'tls']
      );
    } else {
      await db.query(
        `UPDATE smtp_settings SET host = ?, port = ?, username = ?, password = ?,
         from_email = ?, from_name = ?, encryption = ? WHERE id = 1`,
        [host || '', port || 587, username || '', actualPassword || '', from_email || '', from_name || '', encryption || 'tls']
      );
    }
    res.json({ message: 'SMTP settings updated' });
  } catch (err) {
    console.error('SMTP settings update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.testSmtp = async (req, res) => {
  try {
    const { test_email } = req.body;
    if (!test_email) {
      return res.status(400).json({ error: 'Test email address required' });
    }
    const transporter = await getTransporter();
    if (!transporter) {
      return res.status(400).json({ error: 'SMTP not configured' });
    }
    await transporter.sendMail({
      from: transporter.defaults.from,
      to: test_email,
      subject: 'SMTP Test - CMS',
      html: '<h2>SMTP Test</h2><p>If you receive this email, your SMTP settings are configured correctly.</p>'
    });
    res.json({ message: 'Test email sent successfully' });
  } catch (err) {
    console.error('SMTP test error:', err);
    res.status(500).json({ error: 'SMTP test failed: ' + err.message });
  }
};
