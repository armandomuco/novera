import { Injectable } from '@nestjs/common';
import { bestSentences, queryTerms } from '../retrieval/relevance';
import { AiProvider, GroundedAnswerRequest, GroundedAnswerResult } from './ai-provider';

const MAX_SOURCES_IN_ANSWER = 3;

/**
 * Local, no-cost provider. It does not generate text: it quotes the sentences from the
 * provided sources that best match the question and cites each one. Because it only copies
 * source text, instructions hidden in a source cannot change its behavior.
 */
@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  async generateGroundedAnswer(request: GroundedAnswerRequest): Promise<GroundedAnswerResult> {
    const terms = queryTerms(request.question);
    const lines: string[] = [];
    const cited: string[] = [];

    for (const source of request.sources) {
      if (cited.length >= MAX_SOURCES_IN_ANSWER) break;
      const sentences = bestSentences(terms, source.content);
      if (!sentences.length) continue;
      lines.push(`${source.title}: ${sentences.join(' ')} [${source.id}]`);
      cited.push(source.id);
    }

    const answer = lines.join('\n');
    return {
      answer,
      citedSourceIds: cited,
      insufficientEvidence: cited.length === 0,
      model: 'mock-extractive-v1',
      usage: {
        inputTokens: estimateTokens(
          request.instructions,
          request.question,
          ...request.sources.map((source) => source.content),
        ),
        outputTokens: estimateTokens(answer),
      },
    };
  }
}

function estimateTokens(...texts: string[]) {
  return Math.ceil(texts.reduce((total, text) => total + text.length, 0) / 4);
}
