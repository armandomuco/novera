# Database Design

MongoDB with Mongoose is selected for core MVP data because the product has flexible knowledge-item metadata, document processing state, and evolving integration payloads.

Vector storage options:

- MongoDB Atlas Vector Search: simplest operational model because core records and embeddings live together.
- PostgreSQL with pgvector: strong relational integrity and SQL filtering, but conflicts with the requested MongoDB-first stack.
- Dedicated vector database: powerful at scale, but premature for the MVP.

Decision: use MongoDB Atlas Vector Search for the MVP, with an embedding repository interface so vector storage can be replaced later.

## Collections

### users

Purpose: account identity.
Fields: email, password, name, avatarUrl, emailVerifiedAt, status, createdAt, updatedAt, deletedAt.
Indexes: unique email, status.
Tenancy: user may belong to many organizations through organizationMembers.

### organizations

Purpose: tenant boundary.
Fields: name, slug, industry, settings, createdBy, updatedBy, createdAt, updatedAt, deletedAt.
Indexes: unique slug.
Tenancy: root tenant record.

### organizationMembers

Purpose: user membership and role.
Fields: organizationId, userId, role, status, invitedBy, joinedAt, createdAt, updatedAt.
Indexes: unique organizationId + userId, role, status.

### invitations

Purpose: invite lifecycle.
Fields: organizationId, email, role, tokenHash, expiresAt, acceptedAt, createdBy, createdAt.
Indexes: organizationId + email, tokenHash, expiresAt.

### sessions

Purpose: refresh token rotation and device sessions.
Fields: userId, tokenHash, userAgent, ipHash, expiresAt, revokedAt, createdAt.
Indexes: userId, tokenHash, expiresAt.

### projects

Purpose: project memory and status.
Fields: organizationId, name, status, description, objectives, startDate, dueDate, archivedAt, createdBy, updatedBy, createdAt, updatedAt, deletedAt.
Indexes: organizationId + status, organizationId + name, dueDate.

### projectMembers

Purpose: project-level access.
Fields: organizationId, projectId, userId, role, createdAt.
Indexes: unique projectId + userId, organizationId + userId.

### knowledgeItems

Purpose: normalized business knowledge.
Fields: organizationId, title, content, type, source, projectId, customerId, tags, permissions, searchableText, aiSummary, embeddingStatus, createdBy, updatedBy, createdAt, updatedAt, deletedAt.
Indexes: organizationId + type, organizationId + projectId, tags, text index on searchableText.

### documents

Purpose: uploaded file metadata.
Fields: organizationId, projectId, title, type, source, status, searchableText, aiSummary, storageKey, originalFileName, mimeType, sizeBytes, checksumSha256, processingError, extractedAt, chunkCount, createdBy, updatedBy, createdAt, updatedAt, deletedAt.
Indexes: organizationId + updatedAt, organizationId + projectId, status.

### documentChunks

Purpose: searchable document fragments.
Fields: organizationId, documentId, projectId, chunkIndex, content, characterCount, createdAt, updatedAt.
Indexes: unique organizationId + documentId + chunkIndex, organizationId + projectId, compound organizationId + text index on content.

Current implementation: normalized document text is split into overlapping 1,200-character chunks with a 180-character overlap. Tenant and optional project IDs are denormalized into each chunk so authorization filters are applied in the MongoDB query before results are returned. Embedding fields and an Atlas vector index will be added when semantic retrieval is introduced.

### decisions

Purpose: explicit decision records.
Fields: organizationId, projectId, title, summary, rationale, decidedAt, participants, sourceKnowledgeItemId, createdBy, createdAt, updatedAt.
Indexes: organizationId + projectId, decidedAt.

### customers

Purpose: customer context.
Fields: organizationId, name, contacts, status, notes, createdBy, updatedBy, createdAt, updatedAt, deletedAt.
Indexes: organizationId + name.

### risks

Purpose: risk tracking.
Fields: organizationId, projectId, title, severity, likelihood, status, mitigation, sourceIds, ownerId, createdAt, updatedAt.
Indexes: organizationId + status, severity.

### activityEvents

Purpose: timeline and audit-friendly business events.
Fields: organizationId, actorId, eventType, entityType, entityId, metadata, createdAt.
Indexes: organizationId + createdAt, eventType.

### aiConversations, aiMessages, aiSources

Purpose: assistant history, messages, and cited source links.
Fields: organizationId, userId, projectId, content, role, model, tokenUsage, confidence, sourceRefs, createdAt.
Indexes: organizationId + userId, organizationId + createdAt.

### integrations and integrationSyncJobs

Purpose: provider connection state and background sync.
Fields: organizationId, provider, status, scopes, encryptedConfig, lastSyncedAt, jobStatus, errorSummary, createdAt, updatedAt.
Indexes: organizationId + provider, status.

### notifications

Purpose: user-facing alerts.
Fields: organizationId, userId, type, title, body, readAt, createdAt.
Indexes: userId + readAt.

### auditLogs

Purpose: security-sensitive audit trail.
Fields: organizationId, actorId, action, resourceType, resourceId, ipHash, userAgent, metadata, createdAt.
Indexes: organizationId + createdAt, actorId.

## Denormalization

Store projectId and organizationId on chunks, documents, decisions, and AI records to enforce tenant filters efficiently. Keep source titles or small metadata snapshots in citations for stable historical answers.
