const db = require('../config/db');
const { generateQuotationPdf } = require('../utils/pdf');
const { sendMail } = require('../config/mail');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const [quotations] = await db.query('SELECT * FROM quotations ORDER BY created_at DESC');
    for (const q of quotations) {
      const [items] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY id ASC', [q.id]);
      q.items = items;
    }
    res.json(quotations);
  } catch (err) {
    console.error('Quotations getAll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
    const [items] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY id ASC', [req.params.id]);
    rows[0].items = items;
    res.json(rows[0]);
  } catch (err) {
    console.error('Quotations getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { client_name, client_email, client_company, notes, valid_until, items } = req.body;
    let subtotal = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        subtotal += (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      }
    }
    const quotation_number = 'Q-' + Date.now().toString(36).toUpperCase();
    const [result] = await db.query(
      `INSERT INTO quotations (quotation_number, client_name, client_email, client_company, notes, subtotal, total, valid_until, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quotation_number, client_name, client_email || '', client_company || '', notes || '', subtotal, subtotal, valid_until || null, 'draft']
    );
    const quotationId = result.insertId;
    if (items && items.length > 0) {
      for (const item of items) {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        await db.query(
          'INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
          [quotationId, item.description, qty, price, qty * price]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [quotationId]);
    const [createdItems] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [quotationId]);
    rows[0].items = createdItems;
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Quotations create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { client_name, client_email, client_company, notes, valid_until, status, items } = req.body;
    let subtotal = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        subtotal += (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      }
    }
    await db.query(
      `UPDATE quotations SET client_name = ?, client_email = ?, client_company = ?, notes = ?,
       subtotal = ?, total = ?, valid_until = ?, status = ? WHERE id = ?`,
      [client_name, client_email || '', client_company || '', notes || '', subtotal, subtotal, valid_until || null, status || 'draft', req.params.id]
    );
    if (items) {
      await db.query('DELETE FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
      for (const item of items) {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        await db.query(
          'INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
          [req.params.id, item.description, qty, price, qty * price]
        );
      }
    }
    const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
    const [updatedItems] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    rows[0].items = updatedItems;
    res.json(rows[0]);
  } catch (err) {
    console.error('Quotations update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    const [result] = await db.query('DELETE FROM quotations WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    console.error('Quotations remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.generatePdf = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
    const [items] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    rows[0].items = items;
    const pdfBuffer = await generateQuotationPdf(rows[0]);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].quotation_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Quotation PDF error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
    if (!rows[0].client_email) return res.status(400).json({ error: 'No client email set' });
    const [items] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    rows[0].items = items;
    const pdfBuffer = await generateQuotationPdf(rows[0]);
    await sendMail({
      to: rows[0].client_email,
      subject: subject || `Quotation ${rows[0].quotation_number}`,
      html: message || `<p>Dear ${rows[0].client_name},</p><p>Please find attached your quotation.</p><p>Best regards</p>`,
      attachments: [{
        filename: `${rows[0].quotation_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    await db.query('UPDATE quotations SET status = ? WHERE id = ?', ['sent', req.params.id]);
    res.json({ message: 'Quotation sent successfully' });
  } catch (err) {
    console.error('Quotation send email error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.sendOffer = async (req, res) => {
  try {
    const { payment_link, subject, message } = req.body;
    const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
    if (!rows[0].client_email) return res.status(400).json({ error: 'No client email set' });
    const [items] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    rows[0].items = items;
    const pdfBuffer = await generateQuotationPdf(rows[0]);
    const emailBody = message || `
      <p>Dear ${rows[0].client_name},</p>
      <p>Please find attached your quotation. To proceed with payment, click the link below:</p>
      <p><a href="${payment_link}" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Pay Now</a></p>
      <p>Best regards</p>
    `;
    await sendMail({
      to: rows[0].client_email,
      subject: subject || `Offer - ${rows[0].quotation_number}`,
      html: emailBody,
      attachments: [{
        filename: `${rows[0].quotation_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    await db.query('UPDATE quotations SET status = ?, payment_link = ? WHERE id = ?', ['offered', payment_link || '', req.params.id]);
    res.json({ message: 'Offer sent with payment link' });
  } catch (err) {
    console.error('Quotation send offer error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};
