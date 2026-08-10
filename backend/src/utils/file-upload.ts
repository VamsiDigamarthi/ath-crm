import multer from "multer";
import path from "path";
import fs from "fs";
import { BadRequestError } from "../errors/bad-request-error.js";

const UPLOAD_DIR = "uploads/";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Strict File Filter for Security
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // 1. Allowed Extensions
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".docx", ".txt"];
  
  // 2. Prohibited Dangerous Extensions (Blacklist as a second layer)
  const dangerousExtensions = [".php", ".php3", ".php4", ".php5", ".phtml", ".exe", ".bat", ".sh", ".js", ".html", ".htm"];

  if (dangerousExtensions.includes(ext)) {
    return cb(new BadRequestError("Security Violation: This file type is strictly prohibited!"), false);
  }

  if (!allowedExtensions.includes(ext)) {
    return cb(new BadRequestError(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`), false);
  }

  cb(null, true);
};

/**
 * Reusable Upload Middleware
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Max File Size
  },
});

/**
 * Utility to delete files (reusable for cleanups)
 */
export const deleteFile = (filePath: string) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};
