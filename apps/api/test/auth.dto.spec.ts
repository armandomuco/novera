import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AcceptInvitationDto, SwitchOrganizationDto } from '../src/auth/auth.dto';
import { UploadDocumentDto } from '../src/documents/documents.dto';

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

  it('rejects invalid project ids on multipart document metadata', async () => {
    const dto = plainToInstance(UploadDocumentDto, {
      title: 'Quarterly plan',
      projectId: 'another-tenant',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('projectId');
  });
});
