const router = require('express').Router();
const ctrl = require('../controllers/sliderController');
const auth = require('../middleware/auth');
const { upload, setSubDir } = require('../middleware/upload');

router.get('/', ctrl.getAll);
router.get('/published', ctrl.getPublished);
router.get('/:id', ctrl.getById);
router.post('/', auth, setSubDir('sliders'), upload.single('image'), ctrl.create);
router.put('/:id', auth, setSubDir('sliders'), upload.single('image'), ctrl.update);
router.delete('/:id', auth, ctrl.remove);
router.patch('/:id/toggle', auth, ctrl.togglePublish);

module.exports = router;
