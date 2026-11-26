import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { DocumentChunk, DocumentChunkSchema } from '../documents/document-chunks.schemas';
import { Document, DocumentSchema } from '../documents/documents.schemas';
import { KnowledgeItem, KnowledgeItemSchema } from '../knowledge/knowledge.schemas';
import { OrganizationsModule } from '../organizations/organizations.module';
import { Project, ProjectSchema } from '../projects/projects.schemas';
import { AI_PROVIDER } from './ai/ai-provider';
import { MockAiProvider } from './ai/mock-ai.provider';
import { AssistantController } from './assistant.controller';
import { AssistantInteraction, AssistantInteractionSchema } from './assistant-interactions.schemas';
import { AssistantService } from './assistant.service';
import { AssistantRetrievalService } from './retrieval/assistant-retrieval.service';

@Module({
  imports: [
    AuthModule,
    OrganizationsModule,
    MongooseModule.forFeature([
      { name: DocumentChunk.name, schema: DocumentChunkSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: KnowledgeItem.name, schema: KnowledgeItemSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: AssistantInteraction.name, schema: AssistantInteractionSchema },
    ]),
  ],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AssistantRetrievalService,
    MockAiProvider,
    {
      // AI_PROVIDER selects the adapter. Only the local mock exists today; a hosted model
      // adapter is added here once a provider is chosen.
      provide: AI_PROVIDER,
      inject: [ConfigService, MockAiProvider],
      useFactory: (config: ConfigService, mock: MockAiProvider) => {
        const provider = config.get<string>('AI_PROVIDER') ?? 'mock';
        if (provider !== 'mock') throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
        return mock;
      },
    },
  ],
})
export class AssistantModule {}
