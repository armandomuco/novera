import { Types } from 'mongoose';
import { AuthService } from '../src/auth/auth.service';

function createService(overrides: Record<string, unknown> = {}) {
  const config = {
    get: jest.fn().mockReturnValue('development'),
    getOrThrow: jest.fn((key: string) =>
      key === 'WEB_APP_URL' ? 'http://localhost:5173' : 'test-secret-at-least-32-characters',
    ),
  };
  const userModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    ...((overrides.userModel as object) ?? {}),
  };
  const sessionModel = {
    updateMany: jest.fn(),
    ...((overrides.sessionModel as object) ?? {}),
  };
  const actionTokenModel = {
    updateMany: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    ...((overrides.actionTokenModel as object) ?? {}),
  };
  const service = new AuthService(
    config as never,
    userModel as never,
    {} as never,
    {} as never,
    sessionModel as never,
    {} as never,
    actionTokenModel as never,
  );
  return { service, userModel, sessionModel, actionTokenModel };
}

describe('authentication recovery', () => {
  it('does not reveal whether a password reset email exists', async () => {
    const { service, userModel, actionTokenModel } = createService();
    userModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    const response = await service.requestPasswordReset('missing@example.com');

    expect(response.data.accepted).toBe(true);
    expect(response.data).not.toHaveProperty('previewUrl');
    expect(actionTokenModel.create).not.toHaveBeenCalled();
  });

  it('hashes a replacement password and revokes active sessions', async () => {
    const userId = new Types.ObjectId();
    const { service, userModel, sessionModel, actionTokenModel } = createService();
    actionTokenModel.findOneAndUpdate.mockResolvedValue({ userId });
    userModel.findOneAndUpdate.mockResolvedValue({ _id: userId });
    sessionModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

    await expect(service.completePasswordReset('a'.repeat(64), 'SecurePass123!')).resolves.toEqual({
      data: { passwordReset: true },
    });

    const passwordUpdate = userModel.findOneAndUpdate.mock.calls[0][1].$set.password;
    expect(passwordUpdate).toMatch(/^scrypt:/);
    expect(passwordUpdate).not.toContain('SecurePass123!');
    expect(sessionModel.updateMany).toHaveBeenCalledWith(
      { userId, revokedAt: null },
      expect.objectContaining({ $set: { revokedAt: expect.any(Date) } }),
    );
  });

  it('marks an email verified only after consuming a valid single-use token', async () => {
    const userId = new Types.ObjectId();
    const { service, userModel, actionTokenModel } = createService();
    actionTokenModel.findOneAndUpdate.mockResolvedValue({ userId });
    userModel.findOneAndUpdate.mockResolvedValue({ _id: userId });

    await expect(service.verifyEmail('b'.repeat(64))).resolves.toEqual({
      data: { emailVerified: true },
    });
    expect(actionTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'verify_email', usedAt: null }),
      expect.objectContaining({ $set: { usedAt: expect.any(Date) } }),
      { new: true },
    );
  });
});
