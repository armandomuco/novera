import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  AcceptInvitationDto,
  CompletePasswordResetDto,
  RequestPasswordResetDto,
  SwitchOrganizationDto,
  VerifyEmailDto,
} from '../src/auth/auth.dto';
import { UploadDocumentDto } from '../src/documents/documents.dto';
import { UpdateOrganizationDto } from '../src/organizations/organizations.dto';
import { validateEnvironment } from '../src/common/config/env.validation';

describe('authentication DTO validation', () => {
  it('accepts a complete invitation acceptance payload', async () => {
    const dto = plainToInstance(AcceptInvitationDto, {
      token: 'a'.repeat(64),
      name: 'Alex Morgan',
      password: 'SecurePass123!',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects short invitation tokens and passwords', async () => {
    const dto = plainToInstance(AcceptInvitationDto, {
      token: 'short',
      password: 'weak',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['token', 'password']),
    );
  });

  it('requires a valid MongoDB id when switching organizations', async () => {
    const dto = plainToInstance(SwitchOrganizationDto, { organizationId: 'another-tenant' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('organizationId');
  });

  it('validates password reset requests without accepting malformed emails', async () => {
    const dto = plainToInstance(RequestPasswordResetDto, { email: 'not-an-email' });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('email');
  });

  it('requires secure recovery tokens and a minimum password length', async () => {
    const reset = plainToInstance(CompletePasswordResetDto, {
      token: 'short',
      password: 'weak',
    });
    const verification = plainToInstance(VerifyEmailDto, { token: 'short' });

    const resetErrors = await validate(reset);
    const verificationErrors = await validate(verification);
    expect(resetErrors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['token', 'password']),
    );
    expect(verificationErrors.map((error) => error.property)).toContain('token');
  });

  it('rejects invalid project ids on multipart document metadata', async () => {
    const dto = plainToInstance(UploadDocumentDto, {
      title: 'Quarterly plan',
      projectId: 'another-tenant',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('projectId');
  });

  it('rejects external AI providers in organization settings', async () => {
    const dto = plainToInstance(UpdateOrganizationDto, { aiProvider: 'external-paid-provider' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('aiProvider');
  });

  it('rejects external AI providers in application configuration', () => {
    expect(() => validateEnvironment({ AI_PROVIDER: 'external-paid-provider' })).toThrow();
  });
});
