import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ActivityController } from './activity.controller';
import { ActivityEvent, ActivityEventSchema } from './activity.schemas';
import { ActivityService } from './activity.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: ActivityEvent.name, schema: ActivityEventSchema }]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
