import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterDto } from './auth.dto';
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

  @Post('register')
  @ApiOkResponse({ description: 'Registers a user, creates an organization, and returns tokens.' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOkResponse({ description: 'Authenticates a user and returns tokens.' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @ApiOkResponse({ description: 'Rotates the refresh token and returns a new access token.' })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @ApiOkResponse({ description: 'Revokes a refresh token session.' })
  logout(@Body() body: LogoutDto) {
    return this.authService.logout(body.refreshToken);
  }

  @Get('me')
  @ApiOkResponse({ description: 'Returns the authenticated user and active organization.' })
  me(@Headers('authorization') authorization?: string) {
    return this.authService.me(authorization);
  }
}
