const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/paymentsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const express = require('express');

// Settings
router.get('/settings', auth, ctrl.getSettings);
router.post('/settings', auth, [
  body('provider').notEmpty().withMessage('Provider is required'),
  body('settings').isObject().withMessage('Settings object required')
], validate, ctrl.updateSettings);

// Create payment links
router.post('/stripe/create-link', auth, [
  body('amount').isNumeric().withMessage('Amount is required'),
  body('description').notEmpty().withMessage('Description is required')
], validate, ctrl.createStripePaymentLink);

router.post('/multisafepay/create-link', auth, [
  body('amount').isNumeric().withMessage('Amount is required'),
  body('description').notEmpty().withMessage('Description is required')
], validate, ctrl.createMultiSafePayLink);

// Webhooks (no auth - called by payment providers)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), ctrl.stripeWebhook);
router.get('/multisafepay/webhook', ctrl.multiSafePayWebhook);
router.post('/multisafepay/webhook', ctrl.multiSafePayWebhook);

// Transactions
router.get('/transactions', auth, ctrl.getTransactions);
router.get('/transactions/:id', auth, ctrl.getTransactionById);

module.exports = router;
