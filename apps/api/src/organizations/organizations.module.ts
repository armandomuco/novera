import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthOrganization,
  AuthOrganizationMember,
  AuthOrganizationMemberSchema,
  AuthOrganizationSchema,
} from '../auth/auth.schemas';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: AuthOrganization.name, schema: AuthOrganizationSchema },
      { name: AuthOrganizationMember.name, schema: AuthOrganizationMemberSchema },
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
