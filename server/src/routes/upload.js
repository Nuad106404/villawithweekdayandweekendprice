import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = 'uploads';
    
    // Set different directories based on upload type
    if (file.fieldname === 'slip') {
      uploadDir = 'uploads/slips';
    } else if (file.fieldname === 'image') {
      uploadDir = 'uploads/images';
    }
    
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'slip' ? 'slip-' : '';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Handle slip upload
router.post('/slip', upload.single('slip'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Get the file path relative to the uploads directory
    const relativePath = req.file.path.split('uploads/')[1];
    const fileUrl = `/uploads/${relativePath}`;

    res.json({
      status: 'success',
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading slip:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error uploading file'
    });
  }
});

// Handle general image upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file URL
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
