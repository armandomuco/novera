import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'documents', timestamps: true })
export class Document {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  projectId?: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ default: 'Manual metadata' })
  source!: string;

  @Prop({ default: 'Metadata only' })
  status!: string;

  @Prop({ default: '' })
  searchableText!: string;

  @Prop({ default: '' })
  aiSummary!: string;

  @Prop({ required: true })
  createdBy!: Types.ObjectId;

  @Prop({ required: true })
  updatedBy!: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export type DocumentDocument = HydratedDocument<Document>;
export const DocumentSchema = SchemaFactory.createForClass(Document);

DocumentSchema.index({ organizationId: 1, deletedAt: 1, updatedAt: -1 });
DocumentSchema.index({ organizationId: 1, title: 1, deletedAt: 1 });
