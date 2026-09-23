import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../errors/bad-request-error.js';

// Allowed MIME types and extensions (including Drake Tax software exports: PDF, XML, .d25, .d24, .dtx, .dat, .bak, .zip, etc.)
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
  'application/csv',
  'text/plain', // .txt, .dat, .dtx
  'application/rtf', // .rtf
  'text/rtf', // .rtf
  'application/zip', // .zip
  'application/x-zip-compressed', // .zip on Windows
  'application/x-zip',
  'multipart/x-zip',
  'application/xml', // .xml
  'text/xml', // .xml
  'application/json', // .json
  'application/octet-stream', // .d25, .d24, .dtx, .dat, .bak binary data formats
];

const ALLOWED_EXTENSIONS = [
  '.pdf', '.png', '.jpg', '.jpeg', '.webp',
  '.docx', '.doc', '.xlsx', '.xls', '.csv', '.txt', '.rtf',
  '.zip', '.7z', '.rar',
  '.d25', '.d24', '.d23', '.d22', '.d21', '.d20', '.dtx', '.dat', '.bak', '.xml', '.json'
];

// 50 MB Max File Size Limit for Tax Return / Drake Exports
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Use memory storage so StorageService can process or stream directly
const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestError(
        `Invalid file type "${ext}". Allowed formats are PDF, PNG, JPG, JPEG, Word (.doc, .docx), Excel (.xlsx, .xls, .csv), Text (.txt, .rtf), Drake Tax (.d25, .d24, .xml, .dat, .bak), and ZIP Archives (.zip).`
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
