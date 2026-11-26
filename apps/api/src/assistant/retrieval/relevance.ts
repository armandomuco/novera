// Lexical relevance helpers shared by retrieval ranking and the local mock provider.
// Deliberately simple and deterministic: one scoring function for every source type,
// so documents, knowledge items, and projects rank on the same scale.

// prettier-ignore
const STOP_WORDS = new Set([
  // English
  'a', 'about', 'after', 'all', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'been', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'for', 'from', 'had', 'has', 'have', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'our', 'should', 'so', 'than', 'that',
  'the', 'their', 'them', 'there', 'these', 'they', 'this', 'to', 'us', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would', 'you', 'your',
  // Albanian, Italian, German, French (most common function words only)
  'dhe', 'për', 'nga', 'në', 'me', 'që', 'është', 'pse', 'çfarë', 'si', 'ku',
  'il', 'lo', 'la', 'gli', 'le', 'di', 'da', 'per', 'che', 'non', 'una', 'perché', 'cosa', 'come',
  'der', 'die', 'das', 'und', 'ist', 'nicht', 'ein', 'eine', 'mit', 'für', 'warum', 'was', 'wie',
  'les', 'des', 'du', 'et', 'est', 'une', 'pour', 'pas', 'que', 'qui', 'pourquoi', 'quoi',
]);

/** Folds common English inflections so "delayed" matches "delay" and "projects" matches "project". */
function normalizeTerm(term: string) {
  if (term.length > 5 && term.endsWith('ing')) return term.slice(0, -3);
  if (term.length > 4 && term.endsWith('ed')) return term.slice(0, -2);
  if (term.length > 4 && term.endsWith('es')) return term.slice(0, -2);
  if (term.length > 3 && term.endsWith('s') && !term.endsWith('ss')) return term.slice(0, -1);
  return term;
}

/** Meaningful question words paired with their normalized matching form, de-duplicated by term. */
export function questionTerms(text: string, limit = 12): Array<{ term: string; word: string }> {
  const seen = new Set<string>();
  const result: Array<{ term: string; word: string }> = [];
  for (const word of text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_-]*/gu) ?? []) {
    if (word.length <= 1 || STOP_WORDS.has(word)) continue;
    const term = normalizeTerm(word);
    if (seen.has(term)) continue;
    seen.add(term);
    result.push({ term, word });
    if (result.length === limit) break;
  }
  return result;
}

/** Lower-cased, de-duplicated meaningful terms in their normalized form. */
export function queryTerms(text: string, limit = 12): string[] {
  return questionTerms(text, limit).map((entry) => entry.term);
}

function termSet(text: string) {
  return new Set(
    (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_-]*/gu) ?? []).map(normalizeTerm),
  );
}

/** Query terms that appear in the text. */
export function matchedTerms(terms: string[], text: string): string[] {
  const available = termSet(text);
  return terms.filter((term) => available.has(term));
}

/**
 * Share of query terms present in the body, with a bonus for terms in the title.
 * Range 0..1.5; 0 means the source does not mention any query term.
 */
export function relevanceScore(terms: string[], title: string, body: string) {
  if (!terms.length) return 0;
  const bodyMatches = matchedTerms(terms, `${title} ${body}`).length;
  const titleMatches = matchedTerms(terms, title).length;
  return bodyMatches / terms.length + (0.5 * titleMatches) / terms.length;
}

/** Splits text into sentences and returns the ones that best cover the query terms, in original order. */
export function bestSentences(terms: string[], text: string, max = 2): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, hits: matchedTerms(terms, sentence).length }))
    .filter((entry) => entry.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.index - b.index)
    .slice(0, max)
    .sort((a, b) => a.index - b.index);
  return ranked.map((entry) =>
    entry.sentence.length > 400 ? `${entry.sentence.slice(0, 397)}...` : entry.sentence,
  );
}
