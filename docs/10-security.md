# Security

## Core Requirements

- Memory-hard password hashing. The MVP currently uses Node.js `scrypt` with a unique random salt per password.
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

Email verification and password-reset tokens are random 256-bit values stored only as SHA-256 hashes. They expire, are single-use, and invalidate earlier unused tokens of the same type. Password reset revokes every active session for the account.

Access and refresh JWTs are signed and verified by the audited `jsonwebtoken` library using HS256, explicit algorithm allow-listing, short access expiry, refresh rotation, and server-side session validation.

## Current Dependency Baseline

As of 2026-09-25, `npm audit` reports zero known vulnerabilities after the NestJS/Multer, Vitest, React Router, and authentication dependency updates.
