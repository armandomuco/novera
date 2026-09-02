import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private readonly bucket: string;
  private readonly client: S3Client;
  private bucketReady?: Promise<void>;

  constructor(configService: ConfigService) {
    this.bucket = configService.getOrThrow<string>('S3_BUCKET');
    this.client = new S3Client({
      endpoint: configService.getOrThrow<string>('S3_ENDPOINT'),
      region: configService.getOrThrow<string>('S3_REGION'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: configService.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
  }

  async put(key: string, body: Buffer, contentType: string) {
    await this.ensureBucket();
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    } catch (error) {
      this.logger.error(`S3 PutObject failed: ${this.errorMessage(error)}`);
      throw new ServiceUnavailableException('Document storage is currently unavailable.');
    }
  }

  async get(key: string) {
    try {
      return await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      this.logger.error(`S3 GetObject failed: ${this.errorMessage(error)}`);
      throw new ServiceUnavailableException('Document storage is currently unavailable.');
    }
  }

  private ensureBucket() {
    this.bucketReady ??= this.prepareBucket().catch((error: unknown) => {
      this.bucketReady = undefined;
      throw error;
    });
    return this.bucketReady;
  }

  private async prepareBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      } catch (error) {
        this.logger.error(`S3 bucket initialization failed: ${this.errorMessage(error)}`);
        throw new ServiceUnavailableException('Document storage is currently unavailable.');
      }
    }
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown storage error';
  }
}
