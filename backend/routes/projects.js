const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/projectsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload, setSubDir } = require('../middleware/upload');

// Categories
router.get('/categories', ctrl.getCategories);
router.post('/categories', auth, [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.createCategory);
router.put('/categories/:id', auth, [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.updateCategory);
router.delete('/categories/:id', auth, ctrl.deleteCategory);

// Projects
router.get('/', ctrl.getAll);
router.get('/published', ctrl.getPublished);
router.get('/:id', ctrl.getById);
router.post('/', auth, setSubDir('projects'), upload.array('images', 20), ctrl.create);
router.put('/:id', auth, setSubDir('projects'), upload.array('images', 20), ctrl.update);
router.delete('/:id', auth, ctrl.remove);
router.delete('/images/:imageId', auth, ctrl.deleteImage);

module.exports = router;
