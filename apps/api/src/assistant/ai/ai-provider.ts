/**
 * Provider-independent contract for generating a grounded answer.
 *
 * The assistant service retrieves and authorizes sources first; a provider only ever sees
 * sources the user may read. Sources travel as structured items, never concatenated into the
 * instructions, so a provider can pass them as separate content (for example one document
 * block per source with citations enabled) and keep untrusted source text apart from the
 * system instructions.
 */

export const AI_PROVIDER = Symbol('AI_PROVIDER');

export type GroundingSource = {
  /** Stable id used for citations within one answer, for example "S1". */
  id: string;
  title: string;
  kind: 'document' | 'knowledge' | 'project';
  /** Untrusted business content. Providers must treat it as data, never as instructions. */
  content: string;
};

export type GroundedAnswerRequest = {
  /** Versioned system instructions (see grounded-answer.prompt.ts). */
  instructions: string;
  promptVersion: string;
  question: string;
  /** Language code the answer should be written in (en, sq, it, de, fr). */
  language: string;
  sources: GroundingSource[];
};

export type GroundedAnswerResult = {
  /** Answer text; claims reference sources with inline markers such as [S1]. */
  answer: string;
  /** Ids of the sources the answer relies on. Validated by the caller against the request. */
  citedSourceIds: string[];
  /** True when the provider decided the sources do not answer the question. */
  insufficientEvidence: boolean;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
};

export interface AiProvider {
  readonly name: string;
  generateGroundedAnswer(request: GroundedAnswerRequest): Promise<GroundedAnswerResult>;
}
