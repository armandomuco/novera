import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'projects', timestamps: true })
export class Project {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: 'Planning' })
  status!: string;

  @Prop({ default: 'Medium' })
  riskLevel!: string;

  @Prop()
  ownerName?: string;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ default: 0 })
  progress!: number;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: [String], default: [] })
  objectives!: string[];

  @Prop({ required: true })
  createdBy!: Types.ObjectId;

  @Prop({ required: true })
  updatedBy!: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export type ProjectDocument = HydratedDocument<Project>;
export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ organizationId: 1, deletedAt: 1, updatedAt: -1 });
ProjectSchema.index({ organizationId: 1, name: 1, deletedAt: 1 });
