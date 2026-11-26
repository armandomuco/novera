import { Bot, Download, FileText, FolderKanban, Lightbulb, Loader2 } from 'lucide-react';
import type {
  AssistantAnswer,
  AssistantConfidence,
  AssistantSource,
} from '../../api/productionApi';
import type { Translate, TranslationKey } from '../../i18n';

const confidenceLabel: Record<Exclude<AssistantConfidence, 'none'>, TranslationKey> = {
  high: 'assistantConfidenceHigh',
  medium: 'assistantConfidenceMedium',
  low: 'assistantConfidenceLow',
};

const confidenceStyle: Record<Exclude<AssistantConfidence, 'none'>, string> = {
  high: 'bg-teal/10 text-teal',
  medium: 'bg-amber-50 text-amber-800',
  low: 'bg-red-50 text-red-700',
};

const sourceKind: Record<
  AssistantSource['kind'],
  { label: TranslationKey; icon: typeof FileText }
> = {
  document: { label: 'document', icon: FileText },
  knowledge: { label: 'sourceKindKnowledge', icon: Lightbulb },
  project: { label: 'project', icon: FolderKanban },
};

export function AssistantView({
  answer,
  isAsking,
  onAsk,
  onDownloadDocument,
  question,
  setQuestion,
  t,
}: {
  answer: AssistantAnswer | null;
  isAsking: boolean;
  onAsk: (question: string) => void;
  onDownloadDocument: (documentId: string, title: string) => void;
  question: string;
  setQuestion: (question: string) => void;
  t: Translate;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="surface-panel rounded-ui p-5">
        <h2 className="text-lg font-bold tracking-normal">{t('askBusinessMemory')}</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onAsk(question);
          }}
        >
          <textarea
            className="mt-4 min-h-32 w-full field-frame rounded-ui p-3 text-sm outline-none"
            placeholder={t('assistantQuestionFocus')}
            value={question}
            maxLength={1000}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button
            className="primary-action mt-3 inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white disabled:opacity-60"
            type="submit"
            disabled={isAsking || !question.trim()}
          >
            <Bot size={17} aria-hidden="true" />
            {t('generateAnswer')}
          </button>
        </form>
        <div className="mt-5 grid gap-2">
          {(
            [
              'assistantQuestionDelay',
              'assistantQuestionChanges',
              'assistantQuestionFocus',
              'assistantQuestionDocument',
            ] as const
          ).map((key) => (
            <button
              key={key}
              className="quiet-panel rounded-ui px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-teal/40 hover:bg-white disabled:opacity-60"
              type="button"
              disabled={isAsking}
              onClick={() => onAsk(t(key))}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-panel rounded-ui p-5" aria-live="polite" aria-busy={isAsking}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-teal">{t('answer')}</p>
          {answer && answer.confidence !== 'none' ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${confidenceStyle[answer.confidence]}`}
            >
              {t(confidenceLabel[answer.confidence])}
            </span>
          ) : null}
        </div>

        {isAsking ? (
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
            {t('assistantSearching')}
          </p>
        ) : !answer ? (
          <p className="mt-3 text-base leading-7 text-slate-700">{t('assistantEmpty')}</p>
        ) : !answer.answer ? (
          <div className="mt-3 rounded-ui border border-line bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">{t('assistantNoEvidence')}</p>
            {answer.missingTerms.length ? (
              <p className="mt-2 text-sm text-slate-600">
                {t('assistantMissingTerms')}: {answer.missingTerms.join(', ')}
              </p>
            ) : null}
          </div>
        ) : (
          <AnswerBody answer={answer} onDownloadDocument={onDownloadDocument} t={t} />
        )}
      </div>
    </div>
  );
}

function AnswerBody({
  answer,
  onDownloadDocument,
  t,
}: {
  answer: AssistantAnswer;
  onDownloadDocument: (documentId: string, title: string) => void;
  t: Translate;
}) {
  return (
    <>
      <div className="mt-3 grid gap-2">
        {(answer.answer ?? '').split('\n').map((line, index) => (
          <p key={index} className="text-base leading-7 text-slate-700">
            <CitedText text={line} />
          </p>
        ))}
      </div>

      {answer.missingTerms.length ? (
        <p className="mt-4 text-sm text-slate-600">
          {t('assistantMissingTerms')}: {answer.missingTerms.join(', ')}
        </p>
      ) : null}

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t('supportingSources')}
      </p>
      <ol className="mt-2 grid gap-3">
        {answer.sources.map((source) => {
          const kind = sourceKind[source.kind];
          const Icon = kind.icon;
          return (
            <li key={source.id} className="quiet-panel rounded-ui p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CitationBadge id={source.id} />
                    <Icon size={15} className="shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="truncate">{source.title}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t(kind.label)}
                    {source.projectName && source.kind !== 'project'
                      ? ` · ${source.projectName}`
                      : ''}
                  </p>
                </div>
                {source.kind === 'document' ? (
                  <button
                    className="secondary-action inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ui"
                    type="button"
                    aria-label={t('downloadDocument')}
                    title={t('downloadDocument')}
                    onClick={() => onDownloadDocument(source.entityId, source.title)}
                  >
                    <Download size={15} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{source.excerpt}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 rounded-ui bg-blue-50 p-3 text-sm font-medium text-blue-800">
        {answer.provider === 'mock' ? t('assistantMockNotice') : t('assistantConfidence')}
      </p>
    </>
  );
}

/** Renders "[S1]" citation markers as small numbered badges. */
function CitedText({ text }: { text: string }) {
  const parts = text.split(/(\[S\d+\])/g);
  return (
    <>
      {parts.map((part, index) => {
        const marker = /^\[(S\d+)\]$/.exec(part);
        return marker ? <CitationBadge key={index} id={marker[1]} /> : part;
      })}
    </>
  );
}

function CitationBadge({ id }: { id: string }) {
  return (
    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded bg-teal/10 px-1 align-middle text-[11px] font-bold text-teal">
      {id.slice(1)}
    </span>
  );
}
