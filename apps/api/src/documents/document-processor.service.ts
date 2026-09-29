import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mammoth from 'mammoth';
import { Model, Types } from 'mongoose';
import { PDFParse } from 'pdf-parse';
import { DocumentStorageService } from './document-storage.service';
import { DocumentChunk } from './document-chunks.schemas';
import { chunkDocumentText, createExtractiveSummary, normalizeDocumentText } from './document-text';
import { Document } from './documents.schemas';

@Injectable()
export class DocumentProcessorService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(DocumentChunk.name) private readonly chunkModel: Model<DocumentChunk>,
    private readonly storageService: DocumentStorageService,
  ) {}

  async process(documentId: string, organizationId: string) {
    const document = await this.documentModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(documentId),
        organizationId: new Types.ObjectId(organizationId),
        deletedAt: null,
      },
      { $set: { status: 'Processing', processingError: null } },
      { new: true },
    );
    if (!document?.storageKey) throw new NotFoundException('Document file not found.');

    const stored = await this.storageService.get(document.storageKey);
    if (!stored.Body) throw new NotFoundException('Document file not found.');
    const buffer = Buffer.from(await stored.Body.transformToByteArray());
    const text = await this.extractText(document.type, buffer);
    return this.persistExtractedText(document, text);
  }

  async processText(documentId: Types.ObjectId, organizationId: Types.ObjectId, text: string) {
    const document = await this.documentModel.findOne({
      _id: documentId,
      organizationId,
      deletedAt: null,
    });
    if (!document) throw new NotFoundException('Document not found.');
    return this.persistExtractedText(document, text);
  }

  async markFailed(documentId: string, organizationId: string, error: unknown) {
    await this.documentModel.updateOne(
      { _id: new Types.ObjectId(documentId), organizationId: new Types.ObjectId(organizationId) },
      {
        $set: {
          status: 'Processing failed',
          processingError:
            error instanceof Error ? error.message.slice(0, 500) : 'Document processing failed.',
        },
      },
    );
  }

  private async extractText(type: string, buffer: Buffer) {
    if (type === 'TXT' || type === 'Markdown') return buffer.toString('utf8');
    if (type === 'DOCX') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    if (type === 'PDF') {
      const parser = new PDFParse({ data: buffer });
      try {
        return (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    }
    throw new Error(`Unsupported document type: ${type}`);
  }

  private async persistExtractedText(
    document: Document & { save: () => Promise<unknown> },
    rawText: string,
  ) {
    const text = normalizeDocumentText(rawText);
    if (!text) throw new Error('No extractable text was found in this document.');
    const chunks = chunkDocumentText(text);
    await this.chunkModel.deleteMany({
      organizationId: document.organizationId,
      documentId: document._id,
    });
    if (chunks.length) {
      await this.chunkModel.insertMany(
        chunks.map((chunk) => ({
          ...chunk,
          organizationId: document.organizationId,
          documentId: document._id,
          projectId: document.projectId ?? null,
        })),
      );
    }
    document.searchableText = text;
    document.aiSummary = createExtractiveSummary(text);
    document.status = 'Ready';
    document.processingError = null;
    document.extractedAt = new Date();
    document.chunkCount = chunks.length;
    await document.save();
    return document;
  }
}
