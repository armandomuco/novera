import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './common/config/env.validation';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    HealthModule,
    AuthModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
