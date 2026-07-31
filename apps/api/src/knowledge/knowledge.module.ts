import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from '../activity/activity.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { Project, ProjectSchema } from '../projects/projects.schemas';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeItem, KnowledgeItemSchema } from './knowledge.schemas';
import { KnowledgeService } from './knowledge.service';

@Module({
  imports: [
    AuthModule,
    ActivityModule,
    OrganizationsModule,
    MongooseModule.forFeature([
      { name: KnowledgeItem.name, schema: KnowledgeItemSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
})
export class KnowledgeModule {}
