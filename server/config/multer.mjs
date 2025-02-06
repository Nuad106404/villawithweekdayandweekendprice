import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create required directories
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads/slips'),
    path.join(__dirname, '../uploads/villa'),
    path.join(__dirname, '../uploads/rooms'),
    path.join(__dirname, '../uploads/QR')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF files are allowed.'));
  }
};

// Configure storage for different upload types
const storage = {
  slips: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/slips'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
    }
  }),
  villa: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/villa'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
    }
  }),
  rooms: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/rooms'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
    }
  }),
  qr: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/QR'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
    }
  })
};

const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB limit
};

const upload = {
  slip: multer({ storage: storage.slips, fileFilter, limits }),
  villa: multer({ storage: storage.villa, fileFilter, limits }),
  rooms: multer({ storage: storage.rooms, fileFilter, limits }),
  qr: multer({ storage: storage.qr, fileFilter, limits })
};

export default upload;
