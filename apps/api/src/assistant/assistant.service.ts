import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthContext } from '../auth/auth.types';
import { OrganizationsService } from '../organizations/organizations.service';
import { AI_PROVIDER, AiProvider, GroundingSource } from './ai/ai-provider';
import {
  GROUNDED_ANSWER_PROMPT_VERSION,
  groundedAnswerInstructions,
} from './ai/grounded-answer.prompt';
import { AskAssistantDto } from './assistant.dto';
import {
  AssistantInteraction,
  AssistantInteractionDocument,
} from './assistant-interactions.schemas';
import {
  AssistantRetrievalService,
  RetrievedSource,
} from './retrieval/assistant-retrieval.service';
import { matchedTerms, questionTerms } from './retrieval/relevance';

export type AssistantConfidence = 'high' | 'medium' | 'low' | 'none';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly retrievalService: AssistantRetrievalService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    @InjectModel(AssistantInteraction.name)
    private readonly interactionModel: Model<AssistantInteractionDocument>,
  ) {}

  async ask(auth: AuthContext, body: AskAssistantDto) {
    const startedAt = Date.now();
    const language = body.language ?? 'en';
    await this.organizationsService.requireMembership(auth, auth.organizationId);

    const retrieval = await this.retrievalService.retrieve(auth.organizationId, body.question, {
      projectId: body.projectId,
    });

    // Sources get short per-answer ids so the provider can cite them without seeing database ids.
    const sources = retrieval.sources.map((source, index) => ({ ...source, id: `S${index + 1}` }));

    let answer = '';
    let cited: Array<RetrievedSource & { id: string }> = [];
    let model = 'none';
    let usage = { inputTokens: 0, outputTokens: 0 };

    // With no matching sources there is nothing to ground an answer in, so the provider is not called.
    if (sources.length) {
      const result = await this.aiProvider.generateGroundedAnswer({
        instructions: groundedAnswerInstructions(language),
        promptVersion: GROUNDED_ANSWER_PROMPT_VERSION,
        question: body.question,
        language,
        sources: sources.map((source): GroundingSource => ({
          id: source.id,
          title: source.title,
          kind: source.kind,
          content: source.content,
        })),
      });
      model = result.model;
      usage = result.usage;

      // Only citations that point at sources we actually supplied are kept.
      const sourcesById = new Map(sources.map((source) => [source.id, source]));
      cited = [...new Set(result.citedSourceIds)].flatMap((id) => {
        const source = sourcesById.get(id);
        return source ? [source] : [];
      });
      if (!result.insufficientEvidence && cited.length) {
        answer = removeUnknownMarkers(result.answer, new Set(cited.map((source) => source.id)));
      }
    }

    const coveredTerms = new Set(
      cited.flatMap((source) => matchedTerms(retrieval.terms, `${source.title} ${source.content}`)),
    );
    // Report gaps in the user's own words rather than the normalized matching form.
    const missingTerms = questionTerms(body.question)
      .filter((entry) => !coveredTerms.has(entry.term))
      .map((entry) => entry.word);
    const confidence = answer
      ? scoreConfidence(cited.length, retrieval.terms, coveredTerms)
      : 'none';

    const interaction = await this.recordInteraction(auth, {
      model,
      usage,
      confidence,
      projectId: body.projectId ?? null,
      candidateCount: retrieval.candidateCount,
      sourceCount: sources.length,
      cited,
      latencyMs: Date.now() - startedAt,
    });

    return {
      data: {
        answer: answer || null,
        confidence,
        sources: cited.map((source) => ({
          id: source.id,
          kind: source.kind,
          entityId: source.entityId,
          title: source.title,
          excerpt: source.content.slice(0, 280),
          projectName: source.projectName,
          url: source.url,
        })),
        missingTerms,
        provider: this.aiProvider.name,
        model,
        promptVersion: GROUNDED_ANSWER_PROMPT_VERSION,
        interactionId: interaction?._id.toString() ?? null,
      },
    };
  }

  private async recordInteraction(
    auth: AuthContext,
    input: {
      model: string;
      usage: { inputTokens: number; outputTokens: number };
      confidence: AssistantConfidence;
      projectId: string | null;
      candidateCount: number;
      sourceCount: number;
      cited: RetrievedSource[];
      latencyMs: number;
    },
  ) {
    try {
      return await this.interactionModel.create({
        organizationId: new Types.ObjectId(auth.organizationId),
        userId: new Types.ObjectId(auth.userId),
        provider: this.aiProvider.name,
        model: input.model,
        promptVersion: GROUNDED_ANSWER_PROMPT_VERSION,
        retrieval: {
          projectId: input.projectId,
          candidateCount: input.candidateCount,
          sourceCount: input.sourceCount,
        },
        citedSources: input.cited.map((source) => ({
          kind: source.kind,
          entityId: source.entityId,
        })),
        confidence: input.confidence,
        usage: input.usage,
        latencyMs: input.latencyMs,
      });
    } catch (error) {
      // A failed audit write should not hide an answer the user is allowed to see.
      this.logger.warn(`Could not record assistant interaction: ${(error as Error).message}`);
      return null;
    }
  }
}

/** Removes [Sx] markers that do not refer to a cited source, so the UI never shows a dangling citation. */
function removeUnknownMarkers(answer: string, citedIds: Set<string>) {
  return answer.replace(/\s?\[(S\d+)\]/g, (marker, id: string) => (citedIds.has(id) ? marker : ''));
}

function scoreConfidence(
  citedCount: number,
  terms: string[],
  coveredTerms: Set<string>,
): AssistantConfidence {
  const coverage = terms.length ? coveredTerms.size / terms.length : 0;
  if (citedCount >= 2 && coverage >= 0.75) return 'high';
  if (coverage >= 0.5) return 'medium';
  return 'low';
}
