import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'users' })
export class DemoUser {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  roleLabel!: string;

  @Prop({ required: true })
  status!: string;
}

@Schema({ collection: 'organizations' })
export class DemoOrganization {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  slug!: string;

  @Prop()
  industry?: string;
}

@Schema({ collection: 'projects' })
export class DemoProject {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  status!: string;

  @Prop()
  riskLevel?: string;

  @Prop()
  ownerName?: string;

  @Prop()
  dueDate?: Date;

  @Prop()
  progress?: number;

  @Prop()
  description?: string;

  @Prop([String])
  objectives?: string[];
}

@Schema({ collection: 'knowledgeItems' })
export class DemoKnowledgeItem {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  organizationId!: Types.ObjectId;

  @Prop()
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  type!: string;

  @Prop()
  source?: string;

  @Prop()
  aiSummary?: string;

  @Prop()
  content?: string;
}

@Schema({ collection: 'documents' })
export class DemoDocument {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  organizationId!: Types.ObjectId;

  @Prop()
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  fileName?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  processingStatus?: string;

  @Prop()
  aiSummary?: string;
}

@Schema({ collection: 'risks' })
export class DemoRisk {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  severity?: string;

  @Prop()
  ownerName?: string;

  @Prop()
  mitigation?: string;
}

@Schema({ collection: 'activityEvents' })
export class DemoActivityEvent {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  organizationId!: Types.ObjectId;

  @Prop()
  actorName?: string;

  @Prop()
  eventType?: string;

  @Prop()
  entityName?: string;

  @Prop()
  createdAt?: Date;
}

export type DemoUserDocument = HydratedDocument<DemoUser>;
export type DemoOrganizationDocument = HydratedDocument<DemoOrganization>;
export type DemoProjectDocument = HydratedDocument<DemoProject>;
export type DemoKnowledgeItemDocument = HydratedDocument<DemoKnowledgeItem>;
export type DemoDocumentDocument = HydratedDocument<DemoDocument>;
export type DemoRiskDocument = HydratedDocument<DemoRisk>;
export type DemoActivityEventDocument = HydratedDocument<DemoActivityEvent>;

export const DemoUserSchema = SchemaFactory.createForClass(DemoUser);
export const DemoOrganizationSchema = SchemaFactory.createForClass(DemoOrganization);
export const DemoProjectSchema = SchemaFactory.createForClass(DemoProject);
export const DemoKnowledgeItemSchema = SchemaFactory.createForClass(DemoKnowledgeItem);
export const DemoDocumentSchema = SchemaFactory.createForClass(DemoDocument);
export const DemoRiskSchema = SchemaFactory.createForClass(DemoRisk);
export const DemoActivityEventSchema = SchemaFactory.createForClass(DemoActivityEvent);
