const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = '/uploads/' + (req.uploadSubDir ? req.uploadSubDir + '/' : '') + req.file.filename;
    // Resize if image and resize params provided
    if (req.file.mimetype.startsWith('image/') && req.file.mimetype !== 'image/svg+xml') {
      const { width, height } = req.query;
      if (width || height) {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const fullPath = path.join(uploadDir, filePath.replace('/uploads/', ''));
        const buffer = fs.readFileSync(fullPath);
        const resized = await sharp(buffer)
          .resize(width ? parseInt(width) : null, height ? parseInt(height) : null, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
        fs.writeFileSync(fullPath, resized);
      }
    }
    res.json({
      url: filePath,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload single error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const results = [];
    for (const file of req.files) {
      const filePath = '/uploads/' + (req.uploadSubDir ? req.uploadSubDir + '/' : '') + file.filename;
      // Resize if image
      if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
        const { width, height } = req.query;
        if (width || height) {
          const uploadDir = process.env.UPLOAD_DIR || './uploads';
          const fullPath = path.join(uploadDir, filePath.replace('/uploads/', ''));
          const buffer = fs.readFileSync(fullPath);
          const resized = await sharp(buffer)
            .resize(width ? parseInt(width) : null, height ? parseInt(height) : null, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();
          fs.writeFileSync(fullPath, resized);
        }
      }
      results.push({
        url: filePath,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
    }
    res.json(results);
  } catch (err) {
    console.error('Upload multiple error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { filepath } = req.body;
    if (!filepath) {
      return res.status(400).json({ error: 'Filepath required' });
    }
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const fullPath = path.join(uploadDir, filepath.replace('/uploads/', ''));
    // Prevent directory traversal
    const resolved = path.resolve(fullPath);
    const resolvedUpload = path.resolve(uploadDir);
    if (!resolved.startsWith(resolvedUpload)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      res.json({ message: 'File deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const subDir = req.query.dir || '';
    const targetDir = path.join(uploadDir, subDir);
    const resolved = path.resolve(targetDir);
    const resolvedUpload = path.resolve(uploadDir);
    if (!resolved.startsWith(resolvedUpload)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!fs.existsSync(targetDir)) {
      return res.json([]);
    }
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: '/uploads/' + (subDir ? subDir + '/' : '') + entry.name,
      size: entry.isDirectory() ? 0 : fs.statSync(path.join(targetDir, entry.name)).size,
      modified: fs.statSync(path.join(targetDir, entry.name)).mtime
    }));
    res.json(files);
  } catch (err) {
    console.error('List files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
