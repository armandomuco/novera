import * as crypto from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthOrganization, AuthOrganizationMember, AuthSession, AuthUser } from './auth.schemas';

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
    const user = await this.userModel.findOne({ email: body.email.toLowerCase(), deletedAt: null }).lean();
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
        accessToken: this.signAccessToken(user._id, user.email, session._id, session.organizationId),
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
    const payload = this.verifyAuthorization(authorization);
    const userId = new Types.ObjectId(payload.sub);
    const organizationId = new Types.ObjectId(payload.organizationId);
    const [user, membership, organization] = await Promise.all([
      this.userModel.findOne({ _id: userId, deletedAt: null }).lean(),
      this.organizationMemberModel
        .findOne({ userId, organizationId, status: 'active' })
        .lean(),
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
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new UnauthorizedException('Invalid token.');
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
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
    return this.configService.getOrThrow<string>(type === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET');
  }

  private expirySeconds(secondsFromNow: number) {
    return Math.floor(Date.now() / 1000) + secondsFromNow;
  }

  private async uniqueOrganizationSlug(name: string) {
    const base = name
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
