import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { KnowledgeItem, KnowledgeItemSchema } from '../knowledge/knowledge.schemas';
import { OrganizationsModule } from '../organizations/organizations.module';
import { Project, ProjectSchema } from '../projects/projects.schemas';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    AuthModule,
    OrganizationsModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: KnowledgeItem.name, schema: KnowledgeItemSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
