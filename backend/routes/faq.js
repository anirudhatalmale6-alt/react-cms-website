const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/faqController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Categories
router.get('/categories', ctrl.getCategories);
router.post('/categories', auth, [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.createCategory);
router.put('/categories/:id', auth, [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.updateCategory);
router.delete('/categories/:id', auth, ctrl.deleteCategory);

// FAQs
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', auth, [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required')
], validate, ctrl.create);

router.put('/:id', auth, [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required')
], validate, ctrl.update);

router.delete('/:id', auth, ctrl.remove);

module.exports = router;
