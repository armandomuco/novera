import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './common/config/env.validation';
import { DEFAULT_RATE_LIMIT } from './common/rate-limit';
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
    ThrottlerModule.forRoot([DEFAULT_RATE_LIMIT]),
    ActivityModule,
    HealthModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    KnowledgeModule,
    DocumentsModule,
    DemoRequestsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
