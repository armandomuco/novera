# Security

## Core Requirements

- Argon2 or bcrypt password hashing.
- Access tokens with short expiry.
- Refresh token rotation and session revocation.
- Rate limiting for auth and AI endpoints.
- Request validation with DTOs.
- Secure HTTP headers.
- Strict CORS per environment.
- File type and size validation.
- Malware scanning integration point before document processing.
- Tenant isolation in every query.
- Role-based access control and resource-level permissions.
- Audit logs for sensitive changes.
- Encrypted secrets and integration credentials.
- Safe logging without tokens, secrets, prompts, or sensitive content.
- Dependency auditing in CI.

## Threat Scenarios

- Cross-organization data leakage through a trusted client organization ID.
- Viewer accesses restricted project sources through AI retrieval.
- Uploaded file contains malware or parser exploit payload.
- Prompt injection asks the AI to ignore system rules or reveal other tenant data.
- Refresh token replay after theft.
- Integration token leakage in logs.
- Overly broad admin action without audit trace.

## Security Decisions

Organization IDs from clients are routing hints only. The API must verify membership and role before any read or write.
