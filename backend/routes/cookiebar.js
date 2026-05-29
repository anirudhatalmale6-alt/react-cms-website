const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/cookiebarController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Settings
router.get('/settings', ctrl.getSettings);
router.put('/settings', auth, ctrl.updateSettings);

// Categories
router.get('/categories', ctrl.getCategories);
router.post('/categories', auth, [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.createCategory);
router.put('/categories/:id', auth, [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.updateCategory);
router.delete('/categories/:id', auth, ctrl.deleteCategory);

module.exports = router;
