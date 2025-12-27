import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Disk } from 'flydrive';
import { S3Driver } from 'flydrive/drivers/s3';

@Injectable()
export class StorageService implements OnModuleInit {
  private disk: Disk;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.disk = new Disk(
      new S3Driver({
        credentials: {
          accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
        },
        region: this.configService.get('S3_REGION'),
        bucket: this.configService.get('S3_BUCKET_NAME'),
        visibility: 'public',
      }),
    );
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const path = `${folder}/${fileName}`;

    await this.disk.put(path, file.buffer);

    return path;
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.disk.delete(filePath);
  }

  getFileUrl(filePath?: string): string {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;

    const cleanPath = filePath.replace(/^\//, '');

    const publicUrl =
      this.configService.get('S3_CDN_URL') || this.configService.get('S3_URL');
    const bucketName = this.configService.get('S3_BUCKET_NAME');

    return `${publicUrl}/${bucketName}/${cleanPath}`;
  }
}
