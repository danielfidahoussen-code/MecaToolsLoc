const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');

const router = express.Router();

// Si les variables Cloudinary sont configurées, on utilise Cloudinary
// Sinon on tombe sur le stockage local (dev)
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer en mémoire (pas de disque) pour Cloudinary, ou sur disque pour local
let upload;
if (useCloudinary) {
  upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
} else {
  const path = require('path');
  const fs = require('fs');
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + path.extname(file.originalname));
    },
  });
  upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });
}

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

  if (useCloudinary) {
    try {
      // Upload vers Cloudinary via stream
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'mecatoolsloc', resource_type: 'image' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        Readable.from(req.file.buffer).pipe(stream);
      });
      res.json({ url: result.secure_url });
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      res.status(500).json({ error: 'Erreur upload Cloudinary' });
    }
  } else {
    // Stockage local (dev)
    res.json({ url: `/uploads/${req.file.filename}` });
  }
});

module.exports = router;
