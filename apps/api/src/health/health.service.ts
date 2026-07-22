import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      data: {
        status: 'ok',
        service: 'novera-api',
        version: '0.1.0',
      },
    };
  }
}
