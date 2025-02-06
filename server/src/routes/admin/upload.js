import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import fs from 'fs';

const router = express.Router();

// Create required directories if they don't exist
const createRequiredDirectories = () => {
  const dirs = [
    'public/uploads',
    'public/uploads/QR',
    'public/uploads/villa'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createRequiredDirectories();

// Configure multer for QR code upload
const qrStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/QR');
  },
  filename: function (req, file, cb) {
    const uniquePrefix = uuidv4();
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

// Configure multer for general uploads
const generalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniquePrefix = uuidv4();
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'));
};

const qrUpload = multer({
  storage: qrStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

const generalUpload = multer({
  storage: generalStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

// QR code upload endpoint
router.post('/qr', requireAuth, requireAdmin, qrUpload.single('qrCode'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No QR code file uploaded' });
    }

    // Create URL for the uploaded QR code
    const qrImageUrl = `/uploads/QR/${req.file.filename}`;
    
    res.json({
      message: 'QR code uploaded successfully',
      qrImageUrl
    });
  } catch (error) {
    console.error('Error uploading QR code:', error);
    res.status(500).json({ error: 'Failed to upload QR code' });
  }
});

// General upload endpoint
router.post('/', requireAuth, requireAdmin, generalUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create URL for the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
