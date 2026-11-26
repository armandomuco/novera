import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Types } from 'mongoose';
import { AuthContext } from '../src/auth/auth.types';
import { UpdateProjectDto } from '../src/projects/projects.dto';
import { ProjectsService } from '../src/projects/projects.service';

const organizationId = new Types.ObjectId();
const auth: AuthContext = {
  userId: new Types.ObjectId().toString(),
  email: 'owner@novera.test',
  sessionId: new Types.ObjectId().toString(),
  organizationId: organizationId.toString(),
  role: 'Owner',
};

describe('project responses', () => {
  it('reports progress 0 for records stored without a progress value', async () => {
    const legacyProject = {
      _id: new Types.ObjectId(),
      organizationId,
      name: 'Atlas onboarding',
      status: 'Delayed',
      riskLevel: 'High',
      description: '',
      objectives: [],
    };
    const service = new ProjectsService(
      { findOne: () => ({ lean: () => Promise.resolve(legacyProject) }) } as never,
      { requireMembership: jest.fn().mockResolvedValue({}) } as never,
      { record: jest.fn() } as never,
    );

    const { data } = await service.get(auth, legacyProject._id.toString());

    expect(data.progress).toBe(0);
  });

  it('clears the due date with null and stores progress', async () => {
    const stored = {
      _id: new Types.ObjectId(),
      organizationId,
      name: 'Atlas onboarding',
      status: 'Delayed',
      riskLevel: 'High',
      dueDate: new Date('2026-12-01'),
      progress: 10,
      description: '',
      objectives: [],
    };
    const findOneAndUpdate = jest.fn().mockReturnValue({
      lean: () => Promise.resolve({ ...stored, dueDate: null, progress: 80 }),
    });
    const service = new ProjectsService(
      { findOne: () => ({ lean: () => Promise.resolve(stored) }), findOneAndUpdate } as never,
      { requireMembership: jest.fn().mockResolvedValue({}) } as never,
      { record: jest.fn() } as never,
    );

    const { data } = await service.update(auth, stored._id.toString(), {
      dueDate: null,
      progress: 80,
    });

    const update = findOneAndUpdate.mock.calls[0][1] as { $set: Record<string, unknown> };
    expect(update.$set).toMatchObject({ dueDate: null, progress: 80 });
    expect(data).toMatchObject({ dueDate: null, progress: 80 });
  });

  it('rejects progress outside 0-100 and non-integers', async () => {
    for (const progress of [-1, 101, 12.5]) {
      const errors = await validate(plainToInstance(UpdateProjectDto, { progress }));
      expect(errors.map((error) => error.property)).toEqual(['progress']);
    }
    expect(
      await validate(plainToInstance(UpdateProjectDto, { progress: 100, dueDate: null })),
    ).toEqual([]);
  });
});
