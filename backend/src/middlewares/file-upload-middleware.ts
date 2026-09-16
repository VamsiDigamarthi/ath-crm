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
  'application/csv',
  'text/plain', // .txt
  'application/rtf', // .rtf
  'text/rtf', // .rtf
  'application/zip', // .zip
  'application/x-zip-compressed', // .zip on Windows
  'application/x-zip',
  'multipart/x-zip',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.txt', '.rtf', '.zip', '.7z', '.rar'];

// 25 MB Max File Size Limit
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

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
        `Invalid file type "${ext}". Allowed formats are PDF, PNG, JPG, JPEG, Word (.doc, .docx), Excel (.xlsx, .xls, .csv), Text (.txt, .rtf), and ZIP Archives (.zip).`
      )
    );
  }

  cb(null, true);
};

export const uploadTaxDocument = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 20, // Maximum 20 files per upload request
  },
  fileFilter,
});
