"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const AppError_1 = require("../errors/AppError");
const uploadsDirectory = path_1.default.join(__dirname, '../../uploads');
fs_1.default.mkdirSync(uploadsDirectory, { recursive: true });
// Set storage engine
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadsDirectory);
    },
    filename: function (_req, file, cb) {
        const extensionByMimeType = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
        };
        cb(null, `${(0, crypto_1.randomUUID)()}${extensionByMimeType[file.mimetype]}`);
    },
});
// Initialize upload
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 1000000, files: 1 },
    fileFilter: function (_req, file, cb) {
        checkFileType(file, cb);
    },
});
// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.gif']);
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif']);
    const extname = allowedExtensions.has(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.has(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new AppError_1.AppError(400, 'Only JPEG, PNG, and GIF images are allowed'));
    }
}
exports.default = upload;
