import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationsService {
  getStatus() {
    return {
      data: {
        module: 'organizations',
        status: 'planned',
        tenancyRule:
          'Validate authenticated membership and role before trusting any organization-scoped request.',
        roles: ['Owner', 'Administrator', 'Manager', 'Member', 'Viewer'],
      },
    };
  }
}
