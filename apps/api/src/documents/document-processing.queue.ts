import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
import { DocumentProcessorService } from './document-processor.service';

type DocumentProcessingJob = { documentId: string; organizationId: string };
const queueName = 'document-processing';

@Injectable()
export class DocumentProcessingQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DocumentProcessingQueue.name);
  private queue?: Queue<DocumentProcessingJob>;
  private worker?: Worker<DocumentProcessingJob>;

  constructor(
    private readonly configService: ConfigService,
    private readonly processor: DocumentProcessorService,
  ) {}

  onModuleInit() {
    const connection = {
      host: this.configService.getOrThrow<string>('REDIS_HOST'),
      port: this.configService.getOrThrow<number>('REDIS_PORT'),
      maxRetriesPerRequest: null,
    };
    this.queue = new Queue<DocumentProcessingJob>(queueName, { connection });
    this.worker = new Worker<DocumentProcessingJob>(
      queueName,
      async (job) => {
        await this.processor.process(job.data.documentId, job.data.organizationId);
        return { processed: true };
      },
      { connection, concurrency: 2 },
    );
    this.queue.on('error', (error) => this.logger.error(`Queue error: ${error.message}`));
    this.worker.on('error', (error) => this.logger.error(`Worker error: ${error.message}`));
    this.worker.on('failed', (job, error) => {
      if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
        void this.processor.markFailed(job.data.documentId, job.data.organizationId, error);
      }
    });
  }

  async enqueue(data: DocumentProcessingJob) {
    if (!this.queue) throw new Error('Document processing queue is not ready.');
    const job: Job<DocumentProcessingJob> = await this.queue.add('extract', data, {
      jobId: `${data.documentId}-${Date.now()}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1_000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    });
    return job.id;
  }

  async onModuleDestroy() {
    await Promise.all([this.worker?.close(), this.queue?.close()]);
  }
}
