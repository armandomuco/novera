import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import {
  AuthActionToken,
  AuthActionTokenSchema,
  AuthOrganization,
  AuthOrganizationMember,
  AuthOrganizationMemberSchema,
  AuthOrganizationSchema,
  AuthSession,
  AuthSessionSchema,
  AuthInvitation,
  AuthInvitationSchema,
  AuthUser,
  AuthUserSchema,
} from './auth.schemas';
import { AuthService } from './auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthUser.name, schema: AuthUserSchema },
      { name: AuthOrganization.name, schema: AuthOrganizationSchema },
      { name: AuthOrganizationMember.name, schema: AuthOrganizationMemberSchema },
      { name: AuthSession.name, schema: AuthSessionSchema },
      { name: AuthInvitation.name, schema: AuthInvitationSchema },
      { name: AuthActionToken.name, schema: AuthActionTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
