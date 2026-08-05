import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface IFileStorageService {
  uploadImage(file: Express.Multer.File, userId: string): Promise<string>;
  deleteImage(fileUri: string, userId: string): Promise<boolean>;
}

@Injectable()
export class FileStorageService implements IFileStorageService {
  private readonly storageRoot = path.join(__dirname, '..', 'uploads', 'houses');
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5 MB

  constructor() {
    // Ensure upload directories exist securely outside public routing context
    fs.mkdirSync(path.join(this.storageRoot, 'original'), { recursive: true });
    fs.mkdirSync(path.join(this.storageRoot, 'thumbnails'), { recursive: true });
  }

  /**
   * Validates and processes property image uploads
   * Enforces server-side security policies and returns safe resource URI
   */
  async uploadImage(file: Express.Multer.File, userId: string): Promise<string> {
    // 1. Authenticated User Authorization Guard check
    if (!userId) {
      throw new ForbiddenException('User session is invalid or unauthorized.');
    }

    // 2. Validate File Size limit (5 MB)
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('The selected image exceeds the maximum size of 5 MB.');
    }

    // 3. Validate File Extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException('Only JPG, JPEG, PNG, and WebP images are allowed.');
    }

    // 4. Validate MIME Type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image header mime-type.');
    }

    // 5. File Signature Validation (Verify Magic Bytes)
    const magicBytes = file.buffer.slice(0, 4).toString('hex').toUpperCase();
    const isJpeg = magicBytes.startsWith('FFD8FF');
    const isPng = magicBytes === '89504E47';
    const isWebp = magicBytes.startsWith('52494646'); // RIFF header container

    if (!isJpeg && !isPng && !isWebp) {
      throw new BadRequestException('Malicious file signature detected. Upload aborted.');
    }

    // 6. Randomized Filename Generation (Secure UUID base)
    const secureId = crypto.randomUUID();
    const safeFilename = `${secureId}.webp`; // Normalizes target to WebP
    const destinationPath = path.join(this.storageRoot, 'original', safeFilename);

    // 7. Image Processing Pipeline Simulation
    // In production, we pass the buffer to sharp/imagemin to strip metadata & compress:
    // const processedBuffer = await sharp(file.buffer)
    //   .rotate() // preserve camera orientation
    //   .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
    //   .webp({ quality: 80 }) // Compress
    //   .toBuffer();
    
    // Simulate writing optimized copy
    await fs.promises.writeFile(destinationPath, file.buffer);

    // Return the abstract relative path. The app uses IFileStorageService
    // to map this path to local storage folders or cloud endpoints.
    return `uploads/houses/original/${safeFilename}`;
  }

  /**
   * Securely deletes an image from disk storage
   */
  async deleteImage(fileUri: string, userId: string): Promise<boolean> {
    if (!userId) {
      throw new ForbiddenException('Deletion request unauthorized.');
    }

    // Prevent directory traversal attacks
    const normalizedPath = path.normalize(fileUri).replace(/^(\.\.(\/|\\))+/, '');
    const absolutePath = path.join(this.storageRoot, '..', '..', normalizedPath);

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
      return true;
    }
    return false;
  }
}
