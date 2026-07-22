import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getStatus() {
    return {
      data: {
        module: 'auth',
        status: 'planned',
        capabilities: [
          'registration',
          'login',
          'logout',
          'refresh-token-rotation',
          'password-reset',
          'email-verification',
        ],
      },
    };
  }
}
