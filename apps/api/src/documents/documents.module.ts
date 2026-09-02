import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from '../activity/activity.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { Project, ProjectSchema } from '../projects/projects.schemas';
import { DocumentsController } from './documents.controller';
import { DocumentStorageService } from './document-storage.service';
import { Document, DocumentSchema } from './documents.schemas';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    AuthModule,
    ActivityModule,
    OrganizationsModule,
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentStorageService],
})
export class DocumentsModule {}
