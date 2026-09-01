import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './common/config/env.validation';
import { DemoModule } from './demo/demo.module';
import { DemoRequestsModule } from './demo-requests/demo-requests.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 3000,
      }),
    }),
    ActivityModule,
    HealthModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    KnowledgeModule,
    DocumentsModule,
    DemoModule,
    DemoRequestsModule,
  ],
})
export class AppModule {}
