const db = require('../config/db');

// --- Payment Settings ---
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payment_settings');
    const settings = {};
    rows.forEach(r => {
      if (!settings[r.provider]) settings[r.provider] = {};
      // Mask secret keys
      if (r.setting_key.includes('secret') || r.setting_key.includes('api_key')) {
        settings[r.provider][r.setting_key] = r.setting_value ? '••••••' + r.setting_value.slice(-4) : '';
      } else {
        settings[r.provider][r.setting_key] = r.setting_value;
      }
    });
    res.json(settings);
  } catch (err) {
    console.error('Payment settings get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { provider, settings } = req.body;
    if (!provider || !settings) {
      return res.status(400).json({ error: 'Provider and settings required' });
    }
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(settings)) {
        // Skip masked values
        if (value && value.startsWith('••••••')) continue;
        await conn.query(
          `INSERT INTO payment_settings (provider, setting_key, setting_value)
           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?`,
          [provider, key, value, value]
        );
      }
      await conn.commit();
      res.json({ message: `${provider} settings updated` });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Payment settings update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Create Payment Link (Stripe) ---
exports.createStripePaymentLink = async (req, res) => {
  try {
    const { amount, currency, description, quotation_id } = req.body;
    const [keys] = await db.query(
      "SELECT setting_key, setting_value FROM payment_settings WHERE provider = 'stripe'");
    const stripeSettings = {};
    keys.forEach(r => { stripeSettings[r.setting_key] = r.setting_value; });
    if (!stripeSettings.secret_key) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    const stripe = require('stripe')(stripeSettings.secret_key);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'eur',
          product_data: { name: description || 'Payment' },
          unit_amount: Math.round((parseFloat(amount) || 0) * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { quotation_id: quotation_id || '' }
    });
    // Store transaction
    await db.query(
      `INSERT INTO payment_transactions (provider, transaction_id, amount, currency, status, quotation_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['stripe', session.id, amount, currency || 'eur', 'pending', quotation_id || null, JSON.stringify({ url: session.url })]
    );
    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Stripe payment link error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// --- Create Payment Link (MultiSafePay) ---
exports.createMultiSafePayLink = async (req, res) => {
  try {
    const { amount, currency, description, quotation_id, gateway } = req.body;
    const [keys] = await db.query(
      "SELECT setting_key, setting_value FROM payment_settings WHERE provider = 'multisafepay'");
    const mspSettings = {};
    keys.forEach(r => { mspSettings[r.setting_key] = r.setting_value; });
    if (!mspSettings.api_key) {
      return res.status(400).json({ error: 'MultiSafePay not configured' });
    }
    const isTest = mspSettings.environment === 'test';
    const baseUrl = isTest ? 'https://testapi.multisafepay.com/v1/json' : 'https://api.multisafepay.com/v1/json';
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
    const payload = {
      type: 'redirect',
      order_id: orderId,
      gateway: gateway || '', // iDEAL, WERO, CREDITCARD, etc.
      currency: currency || 'EUR',
      amount: Math.round((parseFloat(amount) || 0) * 100),
      description: description || 'Payment',
      payment_options: {
        notification_url: `${process.env.FRONTEND_URL}/api/payments/multisafepay/webhook`,
        redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
      }
    };
    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': mspSettings.api_key
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!data.success) {
      return res.status(400).json({ error: data.error_info || 'MultiSafePay error' });
    }
    await db.query(
      `INSERT INTO payment_transactions (provider, transaction_id, amount, currency, status, quotation_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['multisafepay', orderId, amount, currency || 'EUR', 'pending', quotation_id || null, JSON.stringify({ url: data.data.payment_url })]
    );
    res.json({ url: data.data.payment_url, order_id: orderId });
  } catch (err) {
    console.error('MultiSafePay payment link error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// --- Stripe Webhook ---
exports.stripeWebhook = async (req, res) => {
  try {
    const [keys] = await db.query(
      "SELECT setting_key, setting_value FROM payment_settings WHERE provider = 'stripe'");
    const stripeSettings = {};
    keys.forEach(r => { stripeSettings[r.setting_key] = r.setting_value; });
    if (!stripeSettings.secret_key) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    const stripe = require('stripe')(stripeSettings.secret_key);
    let event;
    if (stripeSettings.webhook_secret) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeSettings.webhook_secret);
    } else {
      event = req.body;
    }
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await db.query(
          "UPDATE payment_transactions SET status = 'completed', metadata = ? WHERE transaction_id = ?",
          [JSON.stringify(session), session.id]
        );
        if (session.metadata && session.metadata.quotation_id) {
          await db.query("UPDATE quotations SET status = 'paid' WHERE id = ?", [session.metadata.quotation_id]);
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        await db.query(
          "UPDATE payment_transactions SET status = 'expired' WHERE transaction_id = ?",
          [session.id]
        );
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    res.status(400).json({ error: err.message });
  }
};

// --- MultiSafePay Webhook ---
exports.multiSafePayWebhook = async (req, res) => {
  try {
    const { transactionid } = req.query;
    if (!transactionid) return res.status(400).json({ error: 'Missing transactionid' });
    const [keys] = await db.query(
      "SELECT setting_key, setting_value FROM payment_settings WHERE provider = 'multisafepay'");
    const mspSettings = {};
    keys.forEach(r => { mspSettings[r.setting_key] = r.setting_value; });
    const isTest = mspSettings.environment === 'test';
    const baseUrl = isTest ? 'https://testapi.multisafepay.com/v1/json' : 'https://api.multisafepay.com/v1/json';
    const response = await fetch(`${baseUrl}/orders/${transactionid}`, {
      headers: { 'api_key': mspSettings.api_key }
    });
    const data = await response.json();
    if (data.success) {
      const status = data.data.status === 'completed' ? 'completed' : data.data.status;
      await db.query(
        'UPDATE payment_transactions SET status = ?, metadata = ? WHERE transaction_id = ?',
        [status, JSON.stringify(data.data), transactionid]
      );
      if (status === 'completed') {
        const [tx] = await db.query('SELECT quotation_id FROM payment_transactions WHERE transaction_id = ?', [transactionid]);
        if (tx.length > 0 && tx[0].quotation_id) {
          await db.query("UPDATE quotations SET status = 'paid' WHERE id = ?", [tx[0].quotation_id]);
        }
      }
    }
    res.send('OK');
  } catch (err) {
    console.error('MultiSafePay webhook error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Transaction History ---
exports.getTransactions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payment_transactions ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Transactions get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payment_transactions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Transaction getById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
