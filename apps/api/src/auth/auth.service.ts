import * as crypto from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AcceptInvitationDto, LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto';
import {
  AuthInvitation,
  AuthOrganization,
  AuthOrganizationMember,
  AuthSession,
  AuthUser,
} from './auth.schemas';
import { AuthContext } from './auth.types';

type TokenPayload = {
  sub: string;
  email: string;
  sessionId: string;
  organizationId: string;
  type: 'access' | 'refresh';
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AuthUser.name) private readonly userModel: Model<AuthUser>,
    @InjectModel(AuthOrganization.name) private readonly organizationModel: Model<AuthOrganization>,
    @InjectModel(AuthOrganizationMember.name)
    private readonly organizationMemberModel: Model<AuthOrganizationMember>,
    @InjectModel(AuthSession.name) private readonly sessionModel: Model<AuthSession>,
    @InjectModel(AuthInvitation.name) private readonly invitationModel: Model<AuthInvitation>,
  ) {}

  getStatus() {
    return {
      data: {
        module: 'auth',
        status: 'in-progress',
        capabilities: [
          'registration',
          'login',
          'logout',
          'refresh-token-rotation',
          'password hashing',
          'session persistence',
          'invitation acceptance',
          'organization switching',
        ],
      },
    };
  }

  async register(body: RegisterDto) {
    const email = body.email.toLowerCase();
    const existing = await this.userModel.exists({ email, deletedAt: null });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const userId = new Types.ObjectId();
    const organizationId = new Types.ObjectId();
    const slug = await this.uniqueOrganizationSlug(body.organizationName);
    const password = this.hashPassword(body.password);

    await this.userModel.create({
      _id: userId,
      email,
      password,
      name: body.name,
      status: 'active',
      emailVerifiedAt: null,
      deletedAt: null,
    });
    await this.organizationModel.create({
      _id: organizationId,
      name: body.organizationName,
      slug,
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
    });
    await this.organizationMemberModel.create({
      organizationId,
      userId,
      role: 'Owner',
      status: 'active',
      joinedAt: new Date(),
    });

    return this.createSessionResponse(userId, organizationId, email, body.name, 'Owner');
  }

  async login(body: LoginDto) {
    const user = await this.userModel
      .findOne({ email: body.email.toLowerCase(), deletedAt: null })
      .lean();
    if (!user || !this.verifyPassword(body.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const membership = await this.organizationMemberModel
      .findOne({ userId: user._id, status: 'active' })
      .sort({ createdAt: 1 })
      .lean();
    if (!membership) {
      throw new UnauthorizedException('No active organization membership found.');
    }

    return this.createSessionResponse(
      user._id,
      membership.organizationId,
      user.email,
      user.name,
      membership.role,
    );
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyToken(refreshToken, 'refresh');
    const session = await this.sessionModel.findById(payload.sessionId);
    const isSessionValid =
      session &&
      session.userId.toString() === payload.sub &&
      !session.revokedAt &&
      session.expiresAt > new Date() &&
      session.refreshTokenHash === this.hashToken(refreshToken);
    if (!isSessionValid) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.userModel.findOne({ _id: payload.sub, deletedAt: null }).lean();
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    const nextRefreshToken = this.signToken({
      sub: user._id.toString(),
      email: user.email,
      sessionId: session._id.toString(),
      organizationId: session.organizationId.toString(),
      type: 'refresh',
      exp: this.expirySeconds(30 * 24 * 60 * 60),
    });
    session.refreshTokenHash = this.hashToken(nextRefreshToken);
    session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await session.save();

    return {
      data: {
        accessToken: this.signAccessToken(
          user._id,
          user.email,
          session._id,
          session.organizationId,
        ),
        refreshToken: nextRefreshToken,
      },
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const payload = this.verifyToken(refreshToken, 'refresh');
        await this.sessionModel.updateOne(
          { _id: payload.sessionId, refreshTokenHash: this.hashToken(refreshToken) },
          { $set: { revokedAt: new Date() } },
        );
      } catch {
        return { data: { loggedOut: true } };
      }
    }
    return { data: { loggedOut: true } };
  }

  async me(authorization?: string) {
    const auth = await this.authenticateAccessToken(authorization);
    const userId = new Types.ObjectId(auth.userId);
    const organizationId = new Types.ObjectId(auth.organizationId);
    const [user, membership, organization] = await Promise.all([
      this.userModel.findOne({ _id: userId, deletedAt: null }).lean(),
      this.organizationMemberModel.findOne({ userId, organizationId, status: 'active' }).lean(),
      this.organizationModel.findOne({ _id: organizationId, deletedAt: null }).lean(),
    ]);
    if (!user || !membership || !organization) {
      throw new UnauthorizedException('Session is no longer valid.');
    }

    return {
      data: {
        user: this.userResponse(user._id, user.email, user.name, membership.role),
        organization: {
          id: organization._id.toString(),
          name: organization.name,
          slug: organization.slug,
        },
      },
    };
  }

  async updateProfile(authorization: string | undefined, body: UpdateProfileDto) {
    const auth = await this.authenticateAccessToken(authorization);
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(auth.userId), deletedAt: null },
        { $set: { name: body.name, updatedAt: new Date() } },
        { new: true },
      )
      .lean();
    if (!user) {
      throw new UnauthorizedException('Session is no longer valid.');
    }
    return {
      data: this.userResponse(user._id, user.email, user.name, auth.role),
    };
  }

  async getInvitation(token: string) {
    const invitation = await this.findUsableInvitation(token);
    const organization = await this.organizationModel
      .findOne({ _id: invitation.organizationId, deletedAt: null })
      .lean();
    if (!organization) {
      throw new NotFoundException('Invitation workspace no longer exists.');
    }

    return {
      data: {
        email: invitation.email,
        role: invitation.role,
        organization: {
          id: organization._id.toString(),
          name: organization.name,
        },
        expiresAt: invitation.expiresAt.toISOString(),
        accountExists: Boolean(
          await this.userModel.exists({ email: invitation.email, deletedAt: null }),
        ),
      },
    };
  }

  async acceptInvitation(body: AcceptInvitationDto) {
    const invitation = await this.findUsableInvitation(body.token);
    let user = await this.userModel.findOne({ email: invitation.email, deletedAt: null });

    if (user) {
      if (!this.verifyPassword(body.password, user.password)) {
        throw new UnauthorizedException('Invalid password for the invited account.');
      }
    } else {
      if (!body.name?.trim()) {
        throw new BadRequestException('Name is required when creating an invited account.');
      }
      user = await this.userModel.create({
        email: invitation.email,
        password: this.hashPassword(body.password),
        name: body.name.trim(),
        status: 'active',
        emailVerifiedAt: new Date(),
        deletedAt: null,
      });
    }

    const accepted = await this.invitationModel.findOneAndUpdate(
      {
        _id: invitation._id,
        status: 'pending',
        expiresAt: { $gt: new Date() },
      },
      { $set: { status: 'accepted', acceptedAt: new Date() } },
      { new: true },
    );
    if (!accepted) {
      throw new ConflictException('This invitation has already been used or expired.');
    }

    const membership = await this.organizationMemberModel.findOneAndUpdate(
      { organizationId: invitation.organizationId, userId: user._id },
      {
        $set: { role: invitation.role, status: 'active', joinedAt: new Date() },
        $setOnInsert: { organizationId: invitation.organizationId, userId: user._id },
      },
      { new: true, upsert: true },
    );

    return this.createSessionResponse(
      user._id,
      invitation.organizationId,
      user.email,
      user.name,
      membership.role,
    );
  }

  async switchOrganization(auth: AuthContext, organizationId: string) {
    const targetOrganizationId = new Types.ObjectId(organizationId);
    const userId = new Types.ObjectId(auth.userId);
    const [user, organization, membership] = await Promise.all([
      this.userModel.findOne({ _id: userId, deletedAt: null }).lean(),
      this.organizationModel.findOne({ _id: targetOrganizationId, deletedAt: null }).lean(),
      this.organizationMemberModel
        .findOne({ userId, organizationId: targetOrganizationId, status: 'active' })
        .lean(),
    ]);
    if (!user || !organization || !membership) {
      throw new UnauthorizedException('You do not have access to this organization.');
    }

    const nextSession = await this.createSessionResponse(
      user._id,
      targetOrganizationId,
      user.email,
      user.name,
      membership.role,
    );
    await this.sessionModel.updateOne(
      { _id: new Types.ObjectId(auth.sessionId), userId },
      { $set: { revokedAt: new Date() } },
    );
    return nextSession;
  }

  async authenticateAccessToken(authorization?: string): Promise<AuthContext> {
    const payload = this.verifyAuthorization(authorization);
    const userId = new Types.ObjectId(payload.sub);
    const organizationId = new Types.ObjectId(payload.organizationId);
    const [user, membership, organization, session] = await Promise.all([
      this.userModel.exists({ _id: userId, deletedAt: null }),
      this.organizationMemberModel
        .findOne({
          userId,
          organizationId,
          status: 'active',
        })
        .lean(),
      this.organizationModel.exists({ _id: organizationId, deletedAt: null }),
      this.sessionModel.exists({
        _id: new Types.ObjectId(payload.sessionId),
        userId,
        organizationId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }),
    ]);
    if (!user || !membership || !organization || !session) {
      throw new UnauthorizedException('Session is no longer valid.');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
      organizationId: payload.organizationId,
      role: membership.role,
    };
  }

  private async createSessionResponse(
    userId: Types.ObjectId,
    organizationId: Types.ObjectId,
    email: string,
    name: string,
    role: string,
  ) {
    const sessionId = new Types.ObjectId();
    const accessToken = this.signAccessToken(userId, email, sessionId, organizationId);
    const refreshToken = this.signToken({
      sub: userId.toString(),
      email,
      sessionId: sessionId.toString(),
      organizationId: organizationId.toString(),
      type: 'refresh',
      exp: this.expirySeconds(30 * 24 * 60 * 60),
    });
    await this.sessionModel.create({
      _id: sessionId,
      userId,
      organizationId,
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    });

    return {
      data: {
        user: this.userResponse(userId, email, name, role),
        organizationId: organizationId.toString(),
        accessToken,
        refreshToken,
      },
    };
  }

  private signAccessToken(
    userId: Types.ObjectId,
    email: string,
    sessionId: Types.ObjectId,
    organizationId: Types.ObjectId,
  ) {
    return this.signToken({
      sub: userId.toString(),
      email,
      sessionId: sessionId.toString(),
      organizationId: organizationId.toString(),
      type: 'access',
      exp: this.expirySeconds(15 * 60),
    });
  }

  private userResponse(userId: Types.ObjectId, email: string, name: string, role: string) {
    return {
      id: userId.toString(),
      email,
      name,
      role,
      status: 'active',
    };
  }

  private hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedPassword: string) {
    const [, salt, hash] = storedPassword.split(':');
    if (!salt || !hash) {
      return false;
    }
    const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async findUsableInvitation(token: string) {
    if (token.length < 32) {
      throw new NotFoundException('Invitation not found.');
    }
    const invitation = await this.invitationModel.findOne({ tokenHash: this.hashToken(token) });
    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }
    if (invitation.status !== 'pending') {
      throw new ConflictException('This invitation is no longer available.');
    }
    if (invitation.expiresAt <= new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      throw new ConflictException('This invitation has expired.');
    }
    return invitation;
  }

  private signToken(payload: TokenPayload) {
    const header = this.base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = this.base64Url(JSON.stringify(payload));
    const signature = this.sign(`${header}.${body}`, this.secretFor(payload.type));
    return `${header}.${body}.${signature}`;
  }

  private verifyAuthorization(authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    return this.verifyToken(token, 'access');
  }

  private verifyToken(token: string, type: 'access' | 'refresh') {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) {
      throw new UnauthorizedException('Invalid token.');
    }
    const expected = this.sign(`${header}.${body}`, this.secretFor(type));
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid token.');
    }
    let payload: TokenPayload;
    try {
      payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token.');
    }
    if (payload.type !== type || payload.exp < this.expirySeconds(0)) {
      throw new UnauthorizedException('Token expired.');
    }
    return payload;
  }

  private sign(value: string, secret: string) {
    return crypto.createHmac('sha256', secret).update(value).digest('base64url');
  }

  private base64Url(value: string) {
    return Buffer.from(value).toString('base64url');
  }

  private secretFor(type: 'access' | 'refresh') {
    return this.configService.getOrThrow<string>(
      type === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET',
    );
  }

  private expirySeconds(secondsFromNow: number) {
    return Math.floor(Date.now() / 1000) + secondsFromNow;
  }

  private async uniqueOrganizationSlug(name: string) {
    const base =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48) || 'workspace';
    let slug = base;
    let index = 2;
    while (await this.organizationModel.exists({ slug })) {
      slug = `${base}-${index}`;
      index += 1;
    }
    return slug;
  }
}
