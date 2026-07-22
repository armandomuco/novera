import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('status')
  @ApiOkResponse({ description: 'Authentication module readiness.' })
  getStatus() {
    return this.authService.getStatus();
  }
}
