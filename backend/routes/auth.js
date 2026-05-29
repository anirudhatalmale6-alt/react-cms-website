const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/setup', ctrl.checkSetup);

router.post('/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, ctrl.login);

router.get('/me', auth, ctrl.me);

router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, ctrl.changePassword);

module.exports = router;
