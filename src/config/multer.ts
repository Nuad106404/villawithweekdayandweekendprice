import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create required directories
const createUploadDirs = () => {
  const dirs = [
    path.join(process.cwd(), 'server', 'uploads', 'slips'),
    path.join(process.cwd(), 'server', 'uploads', 'villa'),
    path.join(process.cwd(), 'server', 'uploads', 'QR')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

const fileFilter = (req: any, file: any, cb: any) => {
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
      cb(null, path.join(process.cwd(), 'server', 'uploads', 'slips'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
    }
  }),
  villa: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'server', 'uploads', 'villa'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
    }
  }),
  qr: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'server', 'uploads', 'QR'));
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

export const slipUpload = multer({ storage: storage.slips, fileFilter, limits });
export const villaUpload = multer({ storage: storage.villa, fileFilter, limits });
export const qrUpload = multer({ storage: storage.qr, fileFilter, limits });
