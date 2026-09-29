# Testing Strategy

## Unit Tests

Services, guards, DTO validation, role checks, prompt construction, and chunking logic.

## Integration Tests

Auth flows, tenant isolation, organization membership, project access, document processing state, and search filters.

## End-To-End Tests

Registration, onboarding, project creation, document upload, AI question with sources, permission denial.

## Security Tests

Cross-tenant access attempts, role downgrade checks, refresh token rotation, upload validation, prompt-injection fixtures.

## UI Tests

Responsive shell, navigation, dashboard cards, loading states, empty states, error states, and dark mode.

## Current Automated Coverage

- Backend health and DTO validation tests.
- Authentication recovery tests for account-enumeration resistance, scrypt password replacement, session revocation, and single-use email verification.
- Tenant-isolation regression tests for project, knowledge-item, and document access.
- Frontend translation parity tests across all five supported languages.
- Full lint, TypeScript production build, Prettier, dependency audit, and diff checks.

Browser automation for complete authentication, CRUD, role, upload, responsive-layout, and 3D-canvas workflows remains the next testing milestone.
