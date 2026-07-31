import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'activityEvents', timestamps: { createdAt: true, updatedAt: false } })
export class ActivityEvent {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true })
  actorUserId!: Types.ObjectId;

  @Prop()
  actorName?: string;

  @Prop({ required: true, index: true })
  eventType!: string;

  @Prop({ required: true, index: true })
  entityType!: string;

  @Prop({ required: true, index: true })
  entityId!: Types.ObjectId;

  @Prop({ required: true })
  entityName!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  createdAt?: Date;
}

export type ActivityEventDocument = HydratedDocument<ActivityEvent>;
export const ActivityEventSchema = SchemaFactory.createForClass(ActivityEvent);

ActivityEventSchema.index({ organizationId: 1, createdAt: -1 });
