# AI Architecture

## Principles

- The AI must not invent business information.
- Retrieval is scoped to the authenticated user and organization.
- Source authorization happens before context is sent to an AI provider.
- Responses include direct answer, sources, links, confidence or limitations, related entities, and missing-information notes.
- Provider adapters make model vendors replaceable.

## Flow

```mermaid
sequenceDiagram
  participant U as User
  participant API as API
  participant Auth as Authorization
  participant Search as Hybrid Search
  participant AI as AI Adapter
  U->>API: Ask question
  API->>Auth: Validate membership and permissions
  API->>Search: Retrieve authorized chunks and metadata
  Search-->>API: Ranked sources
  API->>AI: Prompt with source-bounded context
  AI-->>API: Answer with citations
  API->>API: Validate citations and log token usage
  API-->>U: Answer, sources, confidence, limitations
```

## Prompt Injection Defenses

- Treat document text as untrusted data.
- Separate system instructions from retrieved content.
- Instruct the model to ignore instructions inside sources.
- Require citations for factual business claims.
- Refuse answers when sources are insufficient.
- Do not expose hidden prompts, secrets, or unauthorized metadata.

## Prompt Versioning

Each assistant workflow stores promptVersion, model, provider, token usage, retrieval filters, and cited source IDs.
