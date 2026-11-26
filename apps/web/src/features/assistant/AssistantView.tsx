import { Bot } from 'lucide-react';
import type { WorkspaceData } from '../../api/workspaceTypes';
import type { Translate } from '../../i18n';

export function AssistantView({
  answer,
  data,
  onAsk,
  question,
  setQuestion,
  t,
}: {
  answer: string;
  data: WorkspaceData;
  onAsk: (question: string) => void;
  question: string;
  setQuestion: (question: string) => void;
  t: Translate;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="surface-panel rounded-ui p-5">
        <h2 className="text-lg font-bold tracking-normal">{t('askBusinessMemory')}</h2>
        <textarea
          className="mt-4 min-h-32 w-full field-frame rounded-ui p-3 text-sm outline-none"
          placeholder={t('assistantQuestionFocus')}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          className="primary-action mt-3 inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
          type="button"
          onClick={() => onAsk(question)}
        >
          <Bot size={17} aria-hidden="true" />
          {t('generateAnswer')}
        </button>
        <div className="mt-5 grid gap-2">
          {[
            t('assistantQuestionDelay'),
            t('assistantQuestionChanges'),
            t('assistantQuestionFocus'),
            t('assistantQuestionDocument'),
          ].map((sample) => (
            <button
              key={sample}
              className="quiet-panel rounded-ui px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-teal/40 hover:bg-white"
              type="button"
              onClick={() => onAsk(sample)}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-panel rounded-ui p-5">
        <p className="text-sm font-semibold text-teal">{t('answer')}</p>
        <p className="mt-3 text-base leading-7 text-slate-700">{answer || t('assistantEmpty')}</p>
        <div className="mt-5 grid gap-3">
          {data.knowledgeItems.slice(0, 3).map((source) => (
            <div key={source.title} className="quiet-panel rounded-ui p-4">
              <p className="text-sm font-bold text-slate-800">{source.title}</p>
              <p className="mt-1 text-sm text-slate-600">{source.source}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-ui bg-blue-50 p-3 text-sm font-medium text-blue-800">
          {data.projects.length + data.knowledgeItems.length + data.documents.length > 0
            ? t('assistantConfidence')
            : t('assistantConfidenceLimited')}
        </p>
      </div>
    </div>
  );
}
