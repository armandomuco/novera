import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from '../activity/activity.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from './projects.schemas';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    AuthModule,
    ActivityModule,
    OrganizationsModule,
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
