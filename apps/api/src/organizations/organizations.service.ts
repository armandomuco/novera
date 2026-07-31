import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthOrganization, AuthOrganizationMember } from '../auth/auth.schemas';
import { AuthContext } from '../auth/auth.types';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(AuthOrganization.name) private readonly organizationModel: Model<AuthOrganization>,
    @InjectModel(AuthOrganizationMember.name)
    private readonly organizationMemberModel: Model<AuthOrganizationMember>,
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
    const organization = await this.organizationModel.findOne({ _id: organizationId, deletedAt: null }).lean();
    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return {
      data: {
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        role: auth.role,
      },
    };
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
}
