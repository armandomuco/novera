import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from '../activity/activity.module';
import {
  AuthInvitation,
  AuthInvitationSchema,
  AuthOrganization,
  AuthOrganizationMember,
  AuthOrganizationMemberSchema,
  AuthOrganizationSchema,
  AuthUser,
  AuthUserSchema,
} from '../auth/auth.schemas';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [
    ActivityModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: AuthOrganization.name, schema: AuthOrganizationSchema },
      { name: AuthOrganizationMember.name, schema: AuthOrganizationMemberSchema },
      { name: AuthUser.name, schema: AuthUserSchema },
      { name: AuthInvitation.name, schema: AuthInvitationSchema },
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
