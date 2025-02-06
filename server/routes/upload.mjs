import express from 'express';
import path from 'path';
import { upload } from '../config/multer.mjs';

const router = express.Router();

// Handle single file upload
router.post('/slip', upload.single('slip'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate the URL for the uploaded file
    const fileUrl = `/uploads/slips/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

export default router;
