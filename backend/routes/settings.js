const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// SMTP
router.get('/smtp', auth, ctrl.getSmtp);
router.put('/smtp', auth, [
  body('host').notEmpty().withMessage('Host is required'),
  body('port').isNumeric().withMessage('Port must be a number')
], validate, ctrl.updateSmtp);
router.post('/smtp/test', auth, [
  body('test_email').isEmail().withMessage('Valid test email required')
], validate, ctrl.testSmtp);

module.exports = router;
