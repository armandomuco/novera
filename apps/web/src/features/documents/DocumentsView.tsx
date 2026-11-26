import { Download, RotateCcw, Search, Upload } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import type { DocumentSearchResult } from '../../api/productionApi';
import type { WorkspaceData } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice';
import type { Translate } from '../../i18n';

export function DocumentsView({
  canUpload,
  data,
  onCreateDocument,
  onDownloadDocument,
  onReprocessDocument,
  onSearchDocuments,
  t,
}: {
  canUpload: boolean;
  data: WorkspaceData;
  onCreateDocument: (input: { title: string; file: File }) => Promise<boolean>;
  onDownloadDocument: (documentId: string, title: string) => Promise<void>;
  onReprocessDocument: (documentId: string) => Promise<void>;
  onSearchDocuments: (query: string) => Promise<DocumentSearchResult[]>;
  t: Translate;
}) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function submitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }
    if (await onCreateDocument({ title: title || file.name.replace(/\.[^.]+$/, ''), file })) {
      setTitle('');
      setFile(null);
    }
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    setSearchResults(await onSearchDocuments(searchQuery.trim()));
    setIsSearching(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
      <div className="surface-panel rounded-ui p-5">
        <h2 className="text-2xl font-bold tracking-normal">{t('documents')}</h2>
        <form className="mt-5 flex gap-2" onSubmit={submitSearch}>
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t('searchDocuments')}</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
              aria-hidden="true"
            />
            <input
              className="h-10 w-full field-frame rounded-ui pl-10 pr-3 text-sm outline-none"
              placeholder={t('searchDocumentsPlaceholder')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <button
            className="primary-action h-10 rounded-ui px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isSearching || searchQuery.trim().length < 2}
            type="submit"
          >
            {isSearching ? t('searching') : t('searchDocuments')}
          </button>
        </form>
        {searchResults ? (
          <div className="mt-3 border-l-2 border-teal pl-3">
            {searchResults.length ? (
              <div className="space-y-2">
                {searchResults.slice(0, 6).map((result) => (
                  <button
                    key={`${result.documentId}-${result.chunkIndex}`}
                    className="block w-full rounded-ui border border-slate-200 bg-white p-3 text-left transition hover:border-teal/50"
                    type="button"
                    onClick={() => onDownloadDocument(result.documentId, result.title)}
                  >
                    <span className="text-sm font-bold text-slate-800">{result.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      {result.excerpt}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-2 text-sm text-slate-500">{t('documentSearchNoResults')}</p>
            )}
          </div>
        ) : null}
        <div className="table-surface mt-5 overflow-hidden rounded-ui">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('document')}</th>
                <th className="px-4 py-3 font-semibold">{t('project')}</th>
                <th className="px-4 py-3 font-semibold">{t('type')}</th>
                <th className="px-4 py-3 font-semibold">{t('status')}</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">{t('action')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.documents.map((document) => {
                const canRetry = ['Processing failed', 'Queue unavailable'].includes(
                  document.status,
                );
                return (
                  <tr key={document.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {document.title}
                      {document.processingError ? (
                        <span className="mt-1 block max-w-md text-xs font-normal text-red-600">
                          {t('processingError')}: {document.processingError}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{document.project}</td>
                    <td className="px-4 py-3 text-slate-600">{document.type}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span>{document.status}</span>
                      {document.chunkCount ? (
                        <span className="mt-1 block text-xs text-slate-400">
                          {document.chunkCount} {t('documentChunks')}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {canRetry && canUpload && !document.id.startsWith('demo-') ? (
                          <button
                            className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui"
                            type="button"
                            title={t('reprocessDocument')}
                            aria-label={t('reprocessDocument')}
                            onClick={() => onReprocessDocument(document.id)}
                          >
                            <RotateCcw size={16} aria-hidden="true" />
                          </button>
                        ) : null}
                        {document.status !== 'Metadata only' && !document.id.startsWith('demo-') ? (
                          <button
                            className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui"
                            type="button"
                            title={t('downloadDocument')}
                            aria-label={t('downloadDocument')}
                            onClick={() => onDownloadDocument(document.id, document.title)}
                          >
                            <Download size={16} aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!data.documents.length ? (
          <div className="mt-4">
            <EmptyState title={t('noDocumentsTitle')} body={t('noDocumentsBody')} />
          </div>
        ) : null}
      </div>
      {canUpload ? (
        <form className="surface-panel rounded-ui p-5" onSubmit={submitDocument}>
          <Upload className="text-teal" size={24} aria-hidden="true" />
          <h3 className="mt-4 text-lg font-bold tracking-normal">{t('uploadDocument')}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('documentUploadHelp')}</p>
          <input
            className="mt-4 h-10 w-full field-frame rounded-ui px-3 text-sm outline-none"
            placeholder={t('documentTitlePlaceholder')}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label className="secondary-action mt-3 flex min-h-20 cursor-pointer items-center justify-center rounded-ui px-4 py-3 text-center text-sm font-semibold">
            <input
              className="sr-only"
              accept=".pdf,.docx,.txt,.md,.markdown"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : t('selectFile')}
          </label>
          <button
            className="mt-4 h-10 w-full primary-action rounded-ui px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!file}
            type="submit"
          >
            {t('uploadDocument')}
          </button>
        </form>
      ) : (
        <ReadOnlyNotice t={t} />
      )}
    </div>
  );
}
