export type DocumentTextChunk = {
  chunkIndex: number;
  content: string;
  characterStart: number;
  characterEnd: number;
  tokenEstimate: number;
};

export function normalizeDocumentText(value: string) {
  return value
    .replace(/\0/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 2_000_000);
}

export function chunkDocumentText(
  value: string,
  maximumCharacters = 1_200,
  overlapCharacters = 180,
): DocumentTextChunk[] {
  const text = normalizeDocumentText(value);
  if (!text) return [];
  if (maximumCharacters < 200 || overlapCharacters < 0 || overlapCharacters >= maximumCharacters) {
    throw new Error('Invalid document chunk configuration.');
  }

  const chunks: DocumentTextChunk[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maximumCharacters, text.length);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf('\n', end), text.lastIndexOf(' ', end));
      if (boundary > start + Math.floor(maximumCharacters * 0.65)) end = boundary;
    }
    const content = text.slice(start, end).trim();
    if (content) {
      chunks.push({
        chunkIndex: chunks.length,
        content,
        characterStart: start,
        characterEnd: end,
        tokenEstimate: Math.ceil(content.length / 4),
      });
    }
    if (end >= text.length) break;
    const nextStart = Math.max(0, end - overlapCharacters);
    const nextBoundary = text.indexOf(' ', nextStart);
    start = nextBoundary > nextStart && nextBoundary < end ? nextBoundary + 1 : nextStart;
  }
  return chunks;
}

export function createExtractiveSummary(value: string) {
  const text = normalizeDocumentText(value);
  if (!text) return 'No extractable text was found in this document.';
  const sentenceBoundary = text.slice(0, 420).search(/[.!?]\s/);
  const usesCompleteSentence = sentenceBoundary >= 40;
  const end = usesCompleteSentence ? sentenceBoundary + 1 : Math.min(text.length, 320);
  return text.slice(0, end).trim() + (!usesCompleteSentence && end < text.length ? '…' : '');
}
