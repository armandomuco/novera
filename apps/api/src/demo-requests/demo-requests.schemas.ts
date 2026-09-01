import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'demoRequests', timestamps: true })
export class DemoRequest {
  _id!: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  company!: string;

  @Prop({ required: true, trim: true })
  role!: string;

  @Prop({ required: true, trim: true })
  companySize!: string;

  @Prop({ default: '', trim: true })
  useCase!: string;

  @Prop({ default: 'new', index: true })
  status!: string;

  @Prop({ required: true })
  requestedAt!: Date;

  @Prop({ required: true, index: true })
  requestedDemoExpiresAt!: Date;

  @Prop({ default: 'support@novera.example' })
  supportEmail!: string;
}

export type DemoRequestDocument = HydratedDocument<DemoRequest>;
export const DemoRequestSchema = SchemaFactory.createForClass(DemoRequest);

DemoRequestSchema.index({ email: 1, createdAt: -1 });
