import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'users', timestamps: true })
export class AuthUser {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Date, default: null })
  emailVerifiedAt?: Date | null;

  @Prop({ default: 'active' })
  status!: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

@Schema({ collection: 'organizations', timestamps: true })
export class AuthOrganization {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true })
  slug!: string;

  @Prop({ default: 'Knowledge business', trim: true })
  industry?: string;

  @Prop({ type: Object, default: {} })
  settings?: Record<string, unknown>;

  @Prop()
  createdBy?: Types.ObjectId;

  @Prop()
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

@Schema({ collection: 'organizationMembers', timestamps: true })
export class AuthOrganizationMember {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  role!: string;

  @Prop({ default: 'active' })
  status!: string;

  @Prop({ default: Date.now })
  joinedAt!: Date;
}

@Schema({ collection: 'sessions', timestamps: true })
export class AuthSession {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true })
  refreshTokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  revokedAt?: Date | null;
}

@Schema({ collection: 'invitations', timestamps: true })
export class AuthInvitation {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  role!: string;

  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: true })
  invitedBy!: Types.ObjectId;

  @Prop({ type: Date, default: null })
  acceptedAt?: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt?: Date | null;
}

@Schema({ collection: 'authActionTokens', timestamps: true })
export class AuthActionToken {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ['verify_email', 'password_reset'] })
  type!: 'verify_email' | 'password_reset';

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  usedAt?: Date | null;
}

export type AuthUserDocument = HydratedDocument<AuthUser>;
export type AuthOrganizationDocument = HydratedDocument<AuthOrganization>;
export type AuthOrganizationMemberDocument = HydratedDocument<AuthOrganizationMember>;
export type AuthSessionDocument = HydratedDocument<AuthSession>;
export type AuthInvitationDocument = HydratedDocument<AuthInvitation>;
export type AuthActionTokenDocument = HydratedDocument<AuthActionToken>;

export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);
export const AuthOrganizationSchema = SchemaFactory.createForClass(AuthOrganization);
export const AuthOrganizationMemberSchema = SchemaFactory.createForClass(AuthOrganizationMember);
export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
export const AuthInvitationSchema = SchemaFactory.createForClass(AuthInvitation);
export const AuthActionTokenSchema = SchemaFactory.createForClass(AuthActionToken);

AuthOrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
AuthInvitationSchema.index(
  { organizationId: 1, email: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
);
AuthInvitationSchema.index({ tokenHash: 1 }, { unique: true });
AuthActionTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AuthActionTokenSchema.index({ userId: 1, type: 1, usedAt: 1 });
