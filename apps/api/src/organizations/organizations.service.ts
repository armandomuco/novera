import * as crypto from 'node:crypto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { ActivityService } from '../activity/activity.service';
import {
  AuthInvitation,
  AuthOrganization,
  AuthOrganizationMember,
  AuthUser,
} from '../auth/auth.schemas';
import { AuthContext } from '../auth/auth.types';
import { CreateInvitationDto, UpdateOrganizationDto } from './organizations.dto';

const organizationWriteRoles = new Set(['Owner', 'Administrator']);
const invitationWriteRoles = new Set(['Owner', 'Administrator', 'Manager']);

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(AuthOrganization.name) private readonly organizationModel: Model<AuthOrganization>,
    @InjectModel(AuthOrganizationMember.name)
    private readonly organizationMemberModel: Model<AuthOrganizationMember>,
    @InjectModel(AuthUser.name) private readonly userModel: Model<AuthUser>,
    @InjectModel(AuthInvitation.name) private readonly invitationModel: Model<AuthInvitation>,
    private readonly activityService: ActivityService,
    private readonly configService: ConfigService,
  ) {}

  getStatus() {
    return {
      data: {
        module: 'organizations',
        status: 'in-progress',
        tenancyRule:
          'Validate authenticated membership and role before trusting any organization-scoped request.',
        roles: ['Owner', 'Administrator', 'Manager', 'Member', 'Viewer'],
      },
    };
  }

  async listForUser(auth: AuthContext) {
    const memberships = await this.organizationMemberModel
      .find({ userId: new Types.ObjectId(auth.userId), status: 'active' })
      .lean();
    const organizationIds = memberships.map((membership) => membership.organizationId);
    const organizations = await this.organizationModel
      .find({ _id: { $in: organizationIds }, deletedAt: null })
      .sort({ name: 1 })
      .lean();
    const roleByOrganization = new Map(
      memberships.map((membership) => [membership.organizationId.toString(), membership.role]),
    );

    return {
      data: organizations.map((organization) => ({
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        role: roleByOrganization.get(organization._id.toString()) ?? 'Member',
      })),
    };
  }

  async getById(auth: AuthContext, organizationId: string) {
    await this.requireMembership(auth, organizationId);
    const organization = await this.organizationModel
      .findOne({ _id: organizationId, deletedAt: null })
      .lean();
    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return {
      data: {
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        industry: organization.industry ?? 'Knowledge business',
        settings: organization.settings ?? {},
        role: auth.role,
      },
    };
  }

  async update(auth: AuthContext, organizationId: string, body: UpdateOrganizationDto) {
    const membership = await this.requireMembership(auth, organizationId);
    if (!organizationWriteRoles.has(membership.role)) {
      throw new ForbiddenException('You do not have permission to update organization settings.');
    }
    const updated = await this.organizationModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(organizationId), deletedAt: null },
        {
          $set: {
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.industry !== undefined ? { industry: body.industry } : {}),
            ...(body.aiProvider !== undefined ? { 'settings.aiProvider': body.aiProvider } : {}),
            updatedBy: new Types.ObjectId(auth.userId),
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();
    if (!updated) {
      throw new NotFoundException('Organization not found.');
    }
    return {
      data: {
        id: updated._id.toString(),
        name: updated.name,
        slug: updated.slug,
        industry: updated.industry ?? 'Knowledge business',
        settings: updated.settings ?? {},
        role: membership.role,
      },
    };
  }

  async listMembers(auth: AuthContext, organizationId: string) {
    await this.requireMembership(auth, organizationId);
    const memberships = await this.organizationMemberModel
      .find({ organizationId: new Types.ObjectId(organizationId), status: 'active' })
      .sort({ role: 1, joinedAt: 1 })
      .lean();
    const users = await this.userModel
      .find({ _id: { $in: memberships.map((membership) => membership.userId) }, deletedAt: null })
      .lean();
    const userById = new Map(users.map((user) => [user._id.toString(), user]));

    return {
      data: memberships.map((membership) => {
        const user = userById.get(membership.userId.toString());
        return {
          id: membership._id.toString(),
          userId: membership.userId.toString(),
          organizationId: membership.organizationId.toString(),
          name: user?.name ?? 'Unknown member',
          email: user?.email ?? 'unknown@example.com',
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt?.toISOString() ?? null,
        };
      }),
    };
  }

  async listInvitations(auth: AuthContext, organizationId: string) {
    await this.requireMembership(auth, organizationId);
    await this.invitationModel.updateMany(
      {
        organizationId: new Types.ObjectId(organizationId),
        status: 'pending',
        expiresAt: { $lte: new Date() },
      },
      { $set: { status: 'expired' } },
    );
    const invitations = await this.invitationModel
      .find({ organizationId: new Types.ObjectId(organizationId), status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: invitations.map((invitation) => this.invitationResponse(invitation)),
    };
  }

  async createInvitation(auth: AuthContext, organizationId: string, body: CreateInvitationDto) {
    const membership = await this.requireMembership(auth, organizationId);
    if (!invitationWriteRoles.has(membership.role)) {
      throw new ForbiddenException('You do not have permission to invite team members.');
    }

    const email = body.email.toLowerCase();
    const organizationObjectId = new Types.ObjectId(organizationId);
    const existingUser = await this.userModel.findOne({ email, deletedAt: null }).lean();
    if (existingUser) {
      const existingMember = await this.organizationMemberModel.exists({
        organizationId: organizationObjectId,
        userId: existingUser._id,
        status: 'active',
      });
      if (existingMember) {
        throw new ConflictException('This user is already a member of the organization.');
      }
    }

    const existingPending = await this.invitationModel.exists({
      organizationId: organizationObjectId,
      email,
      status: 'pending',
    });
    if (existingPending) {
      throw new ConflictException('A pending invitation already exists for this email.');
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitation = await this.invitationModel.create({
      organizationId: organizationObjectId,
      email,
      role: body.role,
      tokenHash: this.hashInvitationToken(invitationToken),
      status: 'pending',
      expiresAt: new Date(Date.now() + (body.expiresInDays ?? 7) * 24 * 60 * 60 * 1000),
      invitedBy: new Types.ObjectId(auth.userId),
      acceptedAt: null,
      cancelledAt: null,
    });

    await this.activityService.record(auth, {
      organizationId,
      eventType: 'member_invited',
      entityType: 'invitation',
      entityId: invitation._id,
      entityName: email,
      metadata: { role: body.role, expiresAt: invitation.expiresAt.toISOString() },
    });

    const response = this.invitationResponse(invitation.toObject());
    return {
      data: {
        ...response,
        delivery:
          this.configService.get<string>('NODE_ENV') === 'production' ? 'pending' : 'local-preview',
        ...(this.configService.get<string>('NODE_ENV') !== 'production'
          ? {
              previewUrl: `${this.configService.getOrThrow<string>('WEB_APP_URL')}/accept-invitation?token=${invitationToken}`,
            }
          : {}),
      },
    };
  }

  async cancelInvitation(auth: AuthContext, organizationId: string, invitationId: string) {
    const membership = await this.requireMembership(auth, organizationId);
    if (!invitationWriteRoles.has(membership.role)) {
      throw new ForbiddenException('You do not have permission to cancel invitations.');
    }
    if (!Types.ObjectId.isValid(invitationId)) {
      throw new NotFoundException('Invitation not found.');
    }

    const invitation = await this.invitationModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(invitationId),
          organizationId: new Types.ObjectId(organizationId),
          status: 'pending',
        },
        { $set: { status: 'cancelled', cancelledAt: new Date() } },
        { new: true },
      )
      .lean();
    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }

    await this.activityService.record(auth, {
      organizationId,
      eventType: 'invitation_cancelled',
      entityType: 'invitation',
      entityId: invitation._id,
      entityName: invitation.email,
      metadata: { role: invitation.role },
    });

    return { data: this.invitationResponse(invitation) };
  }

  async requireMembership(auth: AuthContext, organizationId: string) {
    if (!Types.ObjectId.isValid(organizationId)) {
      throw new NotFoundException('Organization not found.');
    }
    const membership = await this.organizationMemberModel.findOne({
      userId: new Types.ObjectId(auth.userId),
      organizationId: new Types.ObjectId(organizationId),
      status: 'active',
    });
    if (!membership) {
      throw new ForbiddenException('You do not have access to this organization.');
    }
    return membership;
  }

  private invitationResponse(
    invitation: AuthInvitation & { _id: Types.ObjectId; createdAt?: Date },
  ) {
    return {
      id: invitation._id.toString(),
      organizationId: invitation.organizationId.toString(),
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt?.toISOString() ?? null,
    };
  }

  private hashInvitationToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
