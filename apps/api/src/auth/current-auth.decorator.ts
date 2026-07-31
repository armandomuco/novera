import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthContext, RequestWithAuth } from './auth.types';

export const CurrentAuth = createParamDecorator((_data: unknown, context: ExecutionContext): AuthContext => {
  const request = context.switchToHttp().getRequest<RequestWithAuth>();
  if (!request.auth) {
    throw new Error('Authenticated request context is missing.');
  }
  return request.auth;
});
