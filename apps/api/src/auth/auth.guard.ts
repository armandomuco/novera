import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestWithAuth } from './auth.types';

type HeaderRequest = RequestWithAuth & {
  headers: {
    authorization?: string;
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<HeaderRequest>();
    request.auth = await this.authService.authenticateAccessToken(request.headers.authorization);
    return true;
  }
}
