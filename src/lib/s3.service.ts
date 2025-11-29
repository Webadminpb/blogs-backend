import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as path from 'path';
import * as crypto from 'crypto';
import type { Express } from 'express';

/**
 * Cloudinary-compatible response format for backward compatibility
 */
export interface CloudinaryCompatibleResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private logger = new Logger(S3Service.name);

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    this.bucket =
      process.env.S3_BUCKET || process.env.AWS_BUCKET_NAME || 'dasalon-blog';

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      this.logger.warn(
        'AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) not properly configured in .env',
      );
    }
    if (
      !process.env.S3_BUCKET &&
      !process.env.AWS_BUCKET_NAME &&
      this.bucket === 'dasalon-blog'
    ) {
      this.logger.warn(
        'S3 Bucket name not configured in .env (S3_BUCKET or AWS_BUCKET_NAME). Using default: dasalon-blog',
      );
    }
  }

  /**
   * Upload file to S3 and return Cloudinary-compatible response
   */
  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<CloudinaryCompatibleResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Generate unique filename with timestamp
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      const timestamp = Date.now();
      const randomStr = crypto.randomBytes(4).toString('hex');
      const filename = `${name}-${timestamp}-${randomStr}${ext}`;
      const key = `${folder}/${filename}`;

      const putObjectCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(putObjectCommand);

      // Build the S3 URL
      const secure_url = `https://${this.bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${encodeURIComponent(
        key,
      )}`;

      // Extract format from mimetype or file extension
      const format =
        (ext && ext.replace('.', '').toLowerCase()) ||
        this.getFormatFromMimetype(file.mimetype);

      return {
        secure_url,
        public_id: key, // store the full S3 key as public_id for reliable deletes
        bytes: file.size,
        format,
      };
    } catch (error: unknown) {
      // Type-guard unknown error
      const msg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error uploading file to S3: ${msg}`, stack);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Delete file from S3 by public_id (Cloudinary-compatible)
   *
   * public_id can be:
   * - The S3 key used as public_id (recommended)
   * - A full S3 URL (https://bucket.s3.region.amazonaws.com/key)
   * - A Cloudinary-like id (folder/name-timestamp.ext) — best to use full key
   */
  async deleteFile(public_id: string): Promise<void> {
    try {
      if (!public_id) {
        throw new BadRequestException('public_id is required');
      }

      // If user passed a full URL, extract the path -> key
      let key = public_id;
      try {
        if (
          public_id.startsWith('http://') ||
          public_id.startsWith('https://')
        ) {
          const parsed = new URL(public_id);
          // remove leading slash
          key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
        }
      } catch {
        // ignore URL parse errors and treat public_id as key
        this.logger.debug(
          `deleteFile: could not parse public_id as URL; treating as key: ${public_id}`,
        );
      }

      // If the key already contains the bucket prefix or looks like a full key, we use it as-is.
      // We do NOT append a default extension because the S3 key should be stored as public_id on upload.
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);
      this.logger.log(`Successfully deleted file: ${key}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error deleting file from S3: ${msg}`, stack);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  /**
   * Helper method to extract format from mimetype
   */
  private getFormatFromMimetype(mimetype: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
    };
    return mimeMap[mimetype] || 'unknown';
  }
}
