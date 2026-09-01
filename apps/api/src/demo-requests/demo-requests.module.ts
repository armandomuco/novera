import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemoRequestsController } from './demo-requests.controller';
import { DemoRequest, DemoRequestSchema } from './demo-requests.schemas';
import { DemoRequestsService } from './demo-requests.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: DemoRequest.name, schema: DemoRequestSchema }])],
  controllers: [DemoRequestsController],
  providers: [DemoRequestsService],
})
export class DemoRequestsModule {}
