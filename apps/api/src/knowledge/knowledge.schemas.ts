import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'knowledgeItems', timestamps: true })
export class KnowledgeItem {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ index: true })
  projectId?: Types.ObjectId;

  @Prop({ trim: true })
  customerId?: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ default: 'Manual entry' })
  source!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: '' })
  aiSummary!: string;

  @Prop({ default: 'pending' })
  embeddingStatus!: string;

  @Prop({ required: true })
  createdBy!: Types.ObjectId;

  @Prop({ required: true })
  updatedBy!: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export type KnowledgeItemDocument = HydratedDocument<KnowledgeItem>;
export const KnowledgeItemSchema = SchemaFactory.createForClass(KnowledgeItem);

KnowledgeItemSchema.index({ organizationId: 1, deletedAt: 1, updatedAt: -1 });
KnowledgeItemSchema.index({ organizationId: 1, type: 1, deletedAt: 1 });
KnowledgeItemSchema.index({ organizationId: 1, projectId: 1, deletedAt: 1 });
