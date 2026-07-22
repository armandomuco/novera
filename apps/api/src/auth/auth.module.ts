import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import {
  AuthOrganization,
  AuthOrganizationMember,
  AuthOrganizationMemberSchema,
  AuthOrganizationSchema,
  AuthSession,
  AuthSessionSchema,
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
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
