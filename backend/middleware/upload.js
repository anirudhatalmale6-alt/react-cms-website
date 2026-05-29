const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = req.uploadSubDir || '';
    const dest = path.join(uploadDir, subDir);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = uuidv4() + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'video/mp4', 'video/webm',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/css', 'text/javascript', 'application/javascript',
    'image/x-icon', 'image/vnd.microsoft.icon'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed: ' + file.mimetype), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

function setSubDir(subDir) {
  return (req, res, next) => {
    req.uploadSubDir = subDir;
    next();
  };
}

module.exports = { upload, setSubDir };
