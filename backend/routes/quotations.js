const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/quotationsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, ctrl.getById);

router.post('/', auth, [
  body('client_name').notEmpty().withMessage('Client name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], validate, ctrl.create);

router.put('/:id', auth, [
  body('client_name').notEmpty().withMessage('Client name is required')
], validate, ctrl.update);

router.delete('/:id', auth, ctrl.remove);
router.get('/:id/pdf', auth, ctrl.generatePdf);

router.post('/:id/send', auth, ctrl.sendEmail);
router.post('/:id/offer', auth, [
  body('payment_link').notEmpty().withMessage('Payment link is required')
], validate, ctrl.sendOffer);

module.exports = router;
