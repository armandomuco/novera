import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice';
import type { WorkspaceKnowledgeItem } from '../../api/workspaceTypes';
import type { Translate } from '../../i18n';
import { KnowledgeCard } from './KnowledgeCard';
import { knowledgeTypeOptions } from './knowledgeTypeOptions';

export function KnowledgeView({
  canEdit,
  items,
  onArchiveKnowledge,
  onCreateKnowledge,
  onUpdateKnowledge,
  query,
  setQuery,
  t,
}: {
  canEdit: boolean;
  items: WorkspaceKnowledgeItem[];
  onArchiveKnowledge: (itemId: string) => Promise<void>;
  onCreateKnowledge: (input: { title: string; type: string; summary: string }) => Promise<boolean>;
  onUpdateKnowledge: (input: {
    id: string;
    title: string;
    type: string;
    summary: string;
  }) => Promise<boolean>;
  query: string;
  setQuery: (query: string) => void;
  t: Translate;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('decision');
  const [summary, setSummary] = useState('');

  async function submitKnowledge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onCreateKnowledge({ title, type, summary })) {
      setTitle('');
      setType('decision');
      setSummary('');
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel rounded-ui p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-teal">{t('knowledgeExplorer')}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-normal">{t('searchCompanyMemory')}</h2>
          </div>
          <label className="field-frame flex h-10 min-w-72 items-center gap-2 rounded-ui px-3">
            <Search size={17} className="text-slate-400" aria-hidden="true" />
            <input
              className="w-full border-0 bg-transparent text-sm outline-none"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        {canEdit ? (
          <form
            className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.55fr_1.3fr_auto]"
            onSubmit={submitKnowledge}
          >
            <input
              className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
              aria-label={t('knowledgeTitle')}
              placeholder={t('knowledgeTitlePlaceholder')}
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <select
              aria-label={t('knowledgeType')}
              className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {knowledgeTypeOptions(t).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              aria-label={t('knowledgeContent')}
              className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
              placeholder={t('knowledgeContentPlaceholder')}
              required
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
            <button
              className="primary-action h-10 rounded-ui px-4 text-sm font-semibold text-white"
              type="submit"
            >
              {t('addKnowledge')}
            </button>
          </form>
        ) : (
          <div className="mt-5">
            <ReadOnlyNotice t={t} />
          </div>
        )}
      </div>
      <div className="grid gap-3">
        {items.length ? (
          items.map((item) => (
            <KnowledgeCard
              key={item.id ?? item.title}
              canEdit={canEdit}
              item={item}
              onArchive={onArchiveKnowledge}
              onUpdate={onUpdateKnowledge}
              t={t}
            />
          ))
        ) : (
          <EmptyState title={t('noKnowledgeTitle')} body={t('noKnowledgeBody')} />
        )}
      </div>
    </div>
  );
}
