import { HealthService } from '../src/health/health.service';

describe('HealthService', () => {
  it('returns an ok health response', () => {
    const service = new HealthService();

    expect(service.getHealth()).toEqual({
      data: {
        status: 'ok',
        service: 'novera-api',
        version: '0.1.0',
      },
    });
  });
});
