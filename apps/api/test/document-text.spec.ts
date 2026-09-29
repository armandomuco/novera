import {
  chunkDocumentText,
  createExtractiveSummary,
  normalizeDocumentText,
} from '../src/documents/document-text';

describe('document text processing', () => {
  it('normalizes unsafe and excessive whitespace', () => {
    expect(normalizeDocumentText('  Alpha\0\r\n\r\n\r\n  Beta\t value  ')).toBe(
      'Alpha\n\nBeta value',
    );
  });

  it('creates ordered overlapping chunks without losing the end of the document', () => {
    const text = Array.from({ length: 500 }, (_, index) => `word-${index}`).join(' ');
    const chunks = chunkDocumentText(text, 500, 80);

    expect(chunks.length).toBeGreaterThan(5);
    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual(chunks.map((_, index) => index));
    expect(chunks.at(-1)?.content).toContain('word-499');
    expect(chunks.every((chunk) => chunk.tokenEstimate > 0)).toBe(true);
  });

  it('creates a concise local extractive summary', () => {
    const summary = createExtractiveSummary(
      'The project is delayed because credentials are missing. The delivery team is waiting for customer approval. Additional detail follows.',
    );

    expect(summary).toBe('The project is delayed because credentials are missing.');
  });
});
