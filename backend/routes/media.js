const router = require('express').Router();
const ctrl = require('../controllers/mediaController');
const auth = require('../middleware/auth');
const { upload, setSubDir } = require('../middleware/upload');

router.post('/upload', auth, setSubDir('media'), upload.single('file'), ctrl.uploadSingle);
router.post('/upload-multiple', auth, setSubDir('media'), upload.array('files', 20), ctrl.uploadMultiple);
router.delete('/delete', auth, ctrl.deleteFile);
router.get('/list', auth, ctrl.listFiles);

module.exports = router;
