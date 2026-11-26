import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Audit record for one assistant answer. It stores which sources were used and how,
 * not the question or answer text, so private prompts and business content are not
 * copied into logs.
 */
@Schema({ collection: 'assistantInteractions', timestamps: { createdAt: true, updatedAt: false } })
export class AssistantInteraction {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true })
  model!: string;

  @Prop({ required: true })
  promptVersion!: string;

  @Prop({ type: Object, default: {} })
  retrieval!: { projectId: string | null; candidateCount: number; sourceCount: number };

  @Prop({ type: [Object], default: [] })
  citedSources!: Array<{ kind: string; entityId: string }>;

  @Prop({ required: true })
  confidence!: string;

  @Prop({ type: Object, default: {} })
  usage!: { inputTokens: number; outputTokens: number };

  @Prop({ required: true })
  latencyMs!: number;

  createdAt?: Date;
}

export type AssistantInteractionDocument = HydratedDocument<AssistantInteraction>;
export const AssistantInteractionSchema = SchemaFactory.createForClass(AssistantInteraction);

AssistantInteractionSchema.index({ organizationId: 1, createdAt: -1 });
