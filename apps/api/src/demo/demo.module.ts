import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DemoActivityEvent,
  DemoActivityEventSchema,
  DemoDocument,
  DemoDocumentSchema,
  DemoKnowledgeItem,
  DemoKnowledgeItemSchema,
  DemoOrganization,
  DemoOrganizationSchema,
  DemoProject,
  DemoProjectSchema,
  DemoRisk,
  DemoRiskSchema,
  DemoUser,
  DemoUserSchema,
} from './demo.schemas';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DemoUser.name, schema: DemoUserSchema },
      { name: DemoOrganization.name, schema: DemoOrganizationSchema },
      { name: DemoProject.name, schema: DemoProjectSchema },
      { name: DemoKnowledgeItem.name, schema: DemoKnowledgeItemSchema },
      { name: DemoDocument.name, schema: DemoDocumentSchema },
      { name: DemoRisk.name, schema: DemoRiskSchema },
      { name: DemoActivityEvent.name, schema: DemoActivityEventSchema },
    ]),
  ],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
