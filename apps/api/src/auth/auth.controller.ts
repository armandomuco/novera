import { Body, Controller, Get, Headers, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AcceptInvitationDto,
  CompletePasswordResetDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  RequestPasswordResetDto,
  SwitchOrganizationDto,
  UpdateProfileDto,
  VerifyEmailDto,
} from './auth.dto';
import { SensitiveRateLimit } from '../common/rate-limit';
import { AuthGuard } from './auth.guard';
import { CurrentAuth } from './current-auth.decorator';
import { AuthService } from './auth.service';
import { AuthContext } from './auth.types';

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
  @SensitiveRateLimit()
  @ApiOkResponse({ description: 'Registers a user, creates an organization, and returns tokens.' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @SensitiveRateLimit()
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

  @Post('password-reset/request')
  @SensitiveRateLimit()
  @ApiOkResponse({ description: 'Creates a short-lived password reset request.' })
  requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('password-reset/complete')
  @SensitiveRateLimit()
  @ApiOkResponse({ description: 'Consumes a password reset token and revokes active sessions.' })
  completePasswordReset(@Body() body: CompletePasswordResetDto) {
    return this.authService.completePasswordReset(body.token, body.password);
  }

  @Post('email-verification/verify')
  @SensitiveRateLimit()
  @ApiOkResponse({ description: 'Consumes an email verification token.' })
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('email-verification/request')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Creates a new verification request for the current user.' })
  requestEmailVerification(@CurrentAuth() auth: AuthContext) {
    return this.authService.requestEmailVerification(auth);
  }

  @Get('me')
  @ApiOkResponse({ description: 'Returns the authenticated user and active organization.' })
  me(@Headers('authorization') authorization?: string) {
    return this.authService.me(authorization);
  }

  @Patch('me')
  @ApiOkResponse({ description: 'Updates the authenticated user profile.' })
  updateMe(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(authorization, body);
  }

  @Get('invitations/:token')
  @SensitiveRateLimit()
  @ApiOkResponse({
    description: 'Validates an invitation link and returns its public workspace details.',
  })
  getInvitation(@Param('token') token: string) {
    return this.authService.getInvitation(token);
  }

  @Post('invitations/accept')
  @SensitiveRateLimit()
  @ApiOkResponse({ description: 'Accepts an invitation and creates a tenant-scoped session.' })
  acceptInvitation(@Body() body: AcceptInvitationDto) {
    return this.authService.acceptInvitation(body);
  }

  @Post('switch-organization')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Switches the active organization and rotates the session.' })
  switchOrganization(@CurrentAuth() auth: AuthContext, @Body() body: SwitchOrganizationDto) {
    return this.authService.switchOrganization(auth, body.organizationId);
  }
}
