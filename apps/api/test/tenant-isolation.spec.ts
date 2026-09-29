import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthContext } from '../src/auth/auth.types';
import { DocumentsService } from '../src/documents/documents.service';
import { KnowledgeService } from '../src/knowledge/knowledge.service';
import { ProjectsService } from '../src/projects/projects.service';

const organizationId = new Types.ObjectId().toString();
const auth: AuthContext = {
  userId: new Types.ObjectId().toString(),
  email: 'owner@novera.test',
  sessionId: new Types.ObjectId().toString(),
  organizationId,
  role: 'Owner',
};

describe('active tenant isolation', () => {
  const organizationsService = {
    requireMembership: jest.fn().mockResolvedValue({ role: 'Owner' }),
  };
  const activityService = { record: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('scopes project lookup to the organization in the active session', async () => {
    const findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const service = new ProjectsService(
      { findOne } as never,
      organizationsService as never,
      activityService as never,
    );

    await expect(service.get(auth, new Types.ObjectId().toString())).rejects.toBeInstanceOf(
      NotFoundException,
    );

    const query = findOne.mock.calls[0][0] as { organizationId: Types.ObjectId };
    expect(query.organizationId.toString()).toBe(organizationId);
    expect(organizationsService.requireMembership).toHaveBeenCalledWith(auth, organizationId);
  });

  it('scopes knowledge lookup to the organization in the active session', async () => {
    const findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const service = new KnowledgeService(
      { findOne } as never,
      {} as never,
      organizationsService as never,
      activityService as never,
    );

    await expect(service.get(auth, new Types.ObjectId().toString())).rejects.toBeInstanceOf(
      NotFoundException,
    );

    const query = findOne.mock.calls[0][0] as { organizationId: Types.ObjectId };
    expect(query.organizationId.toString()).toBe(organizationId);
  });

  it('rejects malformed project filters before querying knowledge', async () => {
    const find = jest.fn();
    const service = new KnowledgeService(
      { find } as never,
      {} as never,
      organizationsService as never,
      activityService as never,
    );

    await expect(service.list(auth, { projectId: 'not-an-object-id' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('scopes document downloads to the organization in the active session', async () => {
    const findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const service = new DocumentsService(
      { findOne } as never,
      {} as never,
      {} as never,
      organizationsService as never,
      activityService as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(service.download(auth, new Types.ObjectId().toString())).rejects.toBeInstanceOf(
      NotFoundException,
    );

    const query = findOne.mock.calls[0][0] as { organizationId: Types.ObjectId };
    expect(query.organizationId.toString()).toBe(organizationId);
  });

  it('prevents viewers from creating document records', async () => {
    const service = new DocumentsService(
      {} as never,
      {} as never,
      {} as never,
      organizationsService as never,
      activityService as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.create({ ...auth, role: 'Viewer' }, { title: 'Private plan', type: 'TXT' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
