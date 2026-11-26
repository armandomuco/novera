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

## Implemented Document Ingestion

```mermaid
flowchart LR
  Upload[Authorized upload] --> Validate[Type, size, signature, safety hook]
  Validate --> Store[MinIO or S3-compatible storage]
  Store --> Text{TXT or Markdown?}
  Text -->|Yes| Extract[Immediate extraction]
  Text -->|No| Queue[BullMQ on Redis]
  Queue --> Worker[PDF or DOCX worker]
  Extract --> Normalize[Normalize and summarize]
  Worker --> Normalize
  Normalize --> Chunks[Tenant-scoped document chunks]
  Chunks --> Search[MongoDB full-text search]
```

- TXT and Markdown are processed in the upload request; PDF and DOCX use a worker with three attempts and exponential backoff.
- Current summaries are deterministic local excerpts, not AI-generated claims.
- Search applies the authenticated organization and optional validated project filter before returning an excerpt and source link.
- The web workspace polls only while documents are processing and exposes retry for failed or unavailable jobs.

## Implemented Assistant (Phase 3)

`POST /api/v1/assistant/ask` answers from the active organization's records only. Code lives in `apps/api/src/assistant/`.

```mermaid
flowchart LR
  Q[Question] --> M[Membership check]
  M --> R[Retrieval: active organization only]
  R --> C1[Document chunks via text index]
  R --> C2[Recent knowledge items]
  R --> C3[Recent projects]
  C1 & C2 & C3 --> Rank[One lexical score for every source type]
  Rank --> Top[Top 6 sources, best chunk per document]
  Top -->|none match| Refuse[No answer, list missing terms]
  Top --> P[AI provider adapter]
  P --> V[Keep only citations to supplied sources]
  V --> A[Answer, sources, confidence, missing terms]
  V --> L[Audit record without question or answer text]
```

- **Provider contract** (`ai/ai-provider.ts`): the provider receives versioned instructions, the question, the language, and sources as a structured list with short ids (`S1`, `S2`, ...). Sources are never concatenated into the instructions, so a hosted-model adapter can send each source as its own content block and keep untrusted text apart from system instructions. The provider returns answer text with `[S1]` markers, the cited ids, an insufficient-evidence flag, the model, and token usage.
- **Instructions** (`ai/grounded-answer.prompt.ts`, version `grounded-answer-v1`): answer only from sources, cite every factual claim, say what is missing instead of guessing, treat source text as data and never follow instructions inside it, answer in the user's language.
- **Local mock provider** (`AI_PROVIDER=mock`, the only option today): quotes the best-matching sentences from the top sources and cites each one. It makes no network call and cannot be steered by text inside a source because it only copies source sentences.
- **Guards around any provider:** retrieval runs before the provider and is filtered by the session's organization; the provider is not called when no source matches; citations to ids that were not supplied are dropped and their markers removed; confidence is computed by the API from how many question terms the cited sources cover, not reported by the model.
- **Audit log** (`assistantInteractions` collection): organization, user, provider, model, prompt version, retrieval counts, cited source ids, confidence, token usage, latency. The question and answer text are not stored.
- **Rate limit:** 20 questions per minute per client IP.

Limits of this version: ranking is keyword-based with light English stemming, so synonyms and other languages match only on shared words; knowledge items and projects are scored from the 300 most recently updated per organization; there is no per-project visibility because the product does not have it yet.

Next: add a hosted-model adapter behind the same contract once a provider is chosen, then embeddings and hybrid ranking behind `AssistantRetrievalService`.
