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

export type AuthUserDocument = HydratedDocument<AuthUser>;
export type AuthOrganizationDocument = HydratedDocument<AuthOrganization>;
export type AuthOrganizationMemberDocument = HydratedDocument<AuthOrganizationMember>;
export type AuthSessionDocument = HydratedDocument<AuthSession>;

export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);
export const AuthOrganizationSchema = SchemaFactory.createForClass(AuthOrganization);
export const AuthOrganizationMemberSchema = SchemaFactory.createForClass(AuthOrganizationMember);
export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);

AuthOrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
