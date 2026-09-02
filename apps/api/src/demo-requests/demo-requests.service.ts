import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDemoRequestDto } from './demo-requests.dto';
import { DemoRequest } from './demo-requests.schemas';

const demoWindowDays = 5;
const supportEmail = 'support@novera.example';

@Injectable()
export class DemoRequestsService {
  constructor(
    @InjectModel(DemoRequest.name) private readonly demoRequestModel: Model<DemoRequest>,
  ) {}

  async create(body: CreateDemoRequestDto) {
    const requestedAt = new Date();
    const requestedDemoExpiresAt = new Date(
      requestedAt.getTime() + demoWindowDays * 24 * 60 * 60 * 1000,
    );
    const request = await this.demoRequestModel.create({
      ...body,
      email: body.email.toLowerCase(),
      useCase: body.useCase ?? '',
      status: 'new',
      requestedAt,
      requestedDemoExpiresAt,
      supportEmail,
    });

    return {
      data: {
        id: request._id.toString(),
        status: request.status,
        supportEmail,
        requestedDemoExpiresAt: requestedDemoExpiresAt.toISOString(),
        message:
          'Demo request received. The team will review it and create a time-limited 5-day demo workspace if approved.',
      },
    };
  }
}
