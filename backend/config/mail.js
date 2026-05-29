const nodemailer = require('nodemailer');
const db = require('./db');

let transporter = null;

async function getTransporter() {
  try {
    const [rows] = await db.query('SELECT * FROM smtp_settings WHERE id = 1');
    if (rows.length === 0) {
      console.warn('No SMTP settings configured');
      return null;
    }
    const s = rows[0];
    if (!s.host || !s.port) {
      console.warn('SMTP settings incomplete');
      return null;
    }
    transporter = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.encryption === 'ssl',
      auth: {
        user: s.username,
        pass: s.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    transporter.defaults = {
      from: `"${s.from_name || 'CMS'}" <${s.from_email || s.username}>`
    };
    return transporter;
  } catch (err) {
    console.error('Failed to create mail transporter:', err.message);
    return null;
  }
}

async function sendMail(options) {
  const t = await getTransporter();
  if (!t) {
    throw new Error('SMTP not configured');
  }
  return t.sendMail({
    from: t.defaults.from,
    ...options
  });
}

module.exports = { getTransporter, sendMail };
