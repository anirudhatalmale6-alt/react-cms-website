const router = require('express').Router();
const ctrl = require('../controllers/seoController');
const auth = require('../middleware/auth');
const { upload, setSubDir } = require('../middleware/upload');

router.get('/', ctrl.getSettings);
router.put('/', auth, setSubDir('seo'), upload.single('favicon'), ctrl.updateSettings);
router.get('/sitemap.xml', ctrl.getSitemap);

module.exports = router;
