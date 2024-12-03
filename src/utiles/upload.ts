import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// check file type
function checkFileType(
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images Only!'));
  }
}

export default upload;
