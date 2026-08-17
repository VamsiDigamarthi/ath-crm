import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface StorageUploadResult {
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface IStorageProvider {
  saveFile(file: Express.Multer.File, subFolder?: string): Promise<StorageUploadResult>;
  deleteFile(filePath: string): Promise<void>;
  getAbsoluteFilePath(filePath: string): string;
  fileExists(filePath: string): boolean;
}

/**
 * Local Disk Storage Provider (Multer / File System)
 */
export class LocalStorageProvider implements IStorageProvider {
  private baseUploadDir: string;

  constructor() {
    this.baseUploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subFolder: string = 'documents'): Promise<StorageUploadResult> {
    const targetFolder = path.join(this.baseUploadDir, subFolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const destinationPath = path.join(targetFolder, uniqueName);

    // If file was loaded into memory or disk by multer
    if (file.buffer) {
      await fs.promises.writeFile(destinationPath, file.buffer);
    } else if (file.path && file.path !== destinationPath) {
      await fs.promises.copyFile(file.path, destinationPath);
      // Clean temp file
      if (fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }

    const relativePath = path.join('uploads', subFolder, uniqueName).replace(/\\/g, '/');

    return {
      filePath: relativePath,
      fileUrl: `/${relativePath}`,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = this.getAbsoluteFilePath(filePath);
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  }

  getAbsoluteFilePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(process.cwd(), filePath);
  }

  fileExists(filePath: string): boolean {
    const absolutePath = this.getAbsoluteFilePath(filePath);
    return fs.existsSync(absolutePath);
  }
}

/**
 * Cloud Storage Provider (Plug-and-play future interface for AWS S3 / GCP / Azure)
 */
export class S3StorageProvider implements IStorageProvider {
  async saveFile(file: Express.Multer.File, subFolder: string = 'documents'): Promise<StorageUploadResult> {
    // Ready to plug in @aws-sdk/client-s3 or @google-cloud/storage in future
    throw new Error('S3 Storage Provider not configured yet. Using LocalStorageProvider.');
  }

  async deleteFile(filePath: string): Promise<void> {
    throw new Error('S3 Storage Provider not configured yet.');
  }

  getAbsoluteFilePath(filePath: string): string {
    return filePath;
  }

  fileExists(filePath: string): boolean {
    return true;
  }
}

// Export singleton instance - switches effortlessly based on ENV
export const StorageService: IStorageProvider = new LocalStorageProvider();
