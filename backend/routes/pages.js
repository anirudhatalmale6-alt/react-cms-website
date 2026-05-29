const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/pagesController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', ctrl.getAll);
router.get('/published', ctrl.getPublished);
router.get('/slug/:slug', ctrl.getBySlug);
router.get('/:id', ctrl.getById);

router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('slug').notEmpty().withMessage('Slug is required')
], validate, ctrl.create);

router.put('/:id', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('slug').notEmpty().withMessage('Slug is required')
], validate, ctrl.update);

router.delete('/:id', auth, ctrl.remove);

module.exports = router;
