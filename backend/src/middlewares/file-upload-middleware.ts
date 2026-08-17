import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../errors/bad-request-error.js';

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc', '.xlsx', '.xls', '.csv'];

// 10 MB Max File Size Limit
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Use memory storage so StorageService can process or stream directly
const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestError(
        `Invalid file type "${ext}". Allowed formats are PDF, PNG, JPG, JPEG, DOCX, XLSX, and CSV.`
      )
    );
  }

  cb(null, true);
};

export const uploadTaxDocument = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Maximum 5 files per upload request
  },
  fileFilter,
});
