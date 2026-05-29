const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/themeController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', ctrl.getAll);
router.get('/:key', ctrl.get);

router.post('/', auth, [
  body('key').notEmpty().withMessage('Key is required'),
  body('value').exists().withMessage('Value is required')
], validate, ctrl.upsert);

router.put('/bulk', auth, [
  body('settings').isObject().withMessage('Settings object required')
], validate, ctrl.bulkUpdate);

router.delete('/:key', auth, ctrl.remove);

module.exports = router;
