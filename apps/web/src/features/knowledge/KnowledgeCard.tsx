import { Archive, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import { knowledgeItems } from '../../data/demoWorkspace';
import type { Translate } from '../../i18n';
import { knowledgeTypeOptions } from './knowledgeTypeOptions';

export function KnowledgeCard({
  canEdit,
  item,
  onArchive,
  onUpdate,
  t,
}: {
  canEdit: boolean;
  item: (typeof knowledgeItems)[number];
  onArchive: (itemId: string) => Promise<void>;
  onUpdate: (input: {
    id: string;
    title: string;
    type: string;
    summary: string;
  }) => Promise<boolean>;
  t: Translate;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState(item.type);
  const [summary, setSummary] = useState(item.summary);

  async function saveKnowledge() {
    if (!item.id || !title.trim() || !summary.trim()) return;
    if (await onUpdate({ id: item.id, title, type, summary })) {
      setIsEditing(false);
    }
  }

  function cancelEditing() {
    setTitle(item.title);
    setType(item.type);
    setSummary(item.summary);
    setIsEditing(false);
  }

  async function archiveKnowledge() {
    if (item.id && window.confirm(t('archiveKnowledgeConfirm'))) await onArchive(item.id);
  }

  return (
    <article className="surface-panel rounded-ui p-4">
      {isEditing ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_0.55fr_1.3fr_auto]">
          <input
            aria-label={t('knowledgeTitle')}
            className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <select
            aria-label={t('knowledgeType')}
            className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
            value={type.toLowerCase().replace(/ /g, '_')}
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
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              aria-label={t('save')}
              className="primary-action inline-flex h-10 w-10 items-center justify-center rounded-ui text-white"
              title={t('save')}
              type="button"
              onClick={saveKnowledge}
            >
              <Save size={16} aria-hidden="true" />
            </button>
            <button
              aria-label={t('cancel')}
              className="secondary-action inline-flex h-10 w-10 items-center justify-center rounded-ui"
              title={t('cancel')}
              type="button"
              onClick={cancelEditing}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-teal">
                  {item.type}
                </span>
                <span className="text-xs font-medium text-slate-500">{item.project}</span>
              </div>
              <h3 className="mt-3 text-base font-bold tracking-normal">{item.title}</h3>
            </div>
            {canEdit && item.id ? (
              <div className="flex gap-2">
                <button
                  aria-label={t('edit')}
                  className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui"
                  title={t('edit')}
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button
                  aria-label={t('archive')}
                  className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui text-red-700"
                  title={t('archive')}
                  type="button"
                  onClick={archiveKnowledge}
                >
                  <Archive size={16} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
        </>
      )}
    </article>
  );
}
