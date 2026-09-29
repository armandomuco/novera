import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'documentChunks', timestamps: true })
export class DocumentChunk {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  documentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  projectId?: Types.ObjectId | null;

  @Prop({ required: true })
  chunkIndex!: number;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  characterStart!: number;

  @Prop({ required: true })
  characterEnd!: number;

  @Prop({ required: true })
  tokenEstimate!: number;
}

export type DocumentChunkDocument = HydratedDocument<DocumentChunk>;
export const DocumentChunkSchema = SchemaFactory.createForClass(DocumentChunk);

DocumentChunkSchema.index({ organizationId: 1, documentId: 1, chunkIndex: 1 }, { unique: true });
DocumentChunkSchema.index({ organizationId: 1, projectId: 1, documentId: 1 });
DocumentChunkSchema.index({ organizationId: 1, content: 'text' });
