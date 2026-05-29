const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/partnersController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload, setSubDir } = require('../middleware/upload');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', auth, setSubDir('partners'), upload.single('logo'), [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.create);

router.put('/:id', auth, setSubDir('partners'), upload.single('logo'), [
  body('name').notEmpty().withMessage('Name is required')
], validate, ctrl.update);

router.delete('/:id', auth, ctrl.remove);

module.exports = router;
