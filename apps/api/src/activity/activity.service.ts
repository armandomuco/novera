import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthContext } from '../auth/auth.types';
import { ActivityEvent } from './activity.schemas';

type RecordActivityInput = {
  organizationId: string | Types.ObjectId;
  eventType: string;
  entityType: string;
  entityId: string | Types.ObjectId;
  entityName: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(ActivityEvent.name) private readonly activityModel: Model<ActivityEvent>,
  ) {}

  async record(auth: AuthContext, input: RecordActivityInput) {
    await this.activityModel.create({
      organizationId: new Types.ObjectId(input.organizationId),
      actorUserId: new Types.ObjectId(auth.userId),
      actorName: auth.email,
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: new Types.ObjectId(input.entityId),
      entityName: input.entityName,
      metadata: input.metadata ?? {},
    });
  }

  async list(auth: AuthContext, organizationId?: string) {
    const tenantId = organizationId ?? auth.organizationId;
    const events = await this.activityModel
      .find({ organizationId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return {
      data: events.map((event) => ({
        id: event._id.toString(),
        organizationId: event.organizationId.toString(),
        actorUserId: event.actorUserId?.toString() ?? null,
        actorName: event.actorName ?? null,
        eventType: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId?.toString() ?? null,
        entityName: event.entityName,
        metadata: event.metadata,
        createdAt: event.createdAt?.toISOString() ?? null,
      })),
    };
  }
}
