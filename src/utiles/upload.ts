import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { AppError } from '../errors/AppError';

const uploadsDirectory = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadsDirectory, { recursive: true });

// Set storage engine
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDirectory);
  },
  filename: function (_req, file, cb) {
    const extensionByMimeType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
    };
    cb(null, `${randomUUID()}${extensionByMimeType[file.mimetype]}`);
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1_000_000, files: 1 },
  fileFilter: function (_req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check file type
function checkFileType(
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  // Allowed extensions
  const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.gif']);
  const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif']);
  const extname = allowedExtensions.has(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMimeTypes.has(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError(400, 'Only JPEG, PNG, and GIF images are allowed'));
  }
}

export default upload;
