import { Archive, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import {
  type ProjectUpdate,
  projectStatuses,
  riskLevels,
  type WorkspaceProject,
} from '../../api/workspaceTypes';
import type { Translate } from '../../i18n';
import { dateInputValue, formatDueDate, riskLabel, statusLabel } from './projectLabels';

export function ProjectCard({
  canEdit,
  onArchive,
  onUpdate,
  project,
  t,
}: {
  canEdit: boolean;
  onArchive: (projectId: string) => Promise<void>;
  onUpdate: (input: ProjectUpdate) => Promise<boolean>;
  project: WorkspaceProject;
  t: Translate;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => draftFrom(project));
  const update = (fields: Partial<ProjectUpdate>) => setDraft({ ...draft, ...fields });

  async function saveProject() {
    if (!draft.name.trim() || !draft.owner.trim() || !draft.summary.trim()) return;
    if (await onUpdate({ ...draft, progress: clampProgress(draft.progress) })) {
      setIsEditing(false);
    }
  }

  function startEditing() {
    setDraft(draftFrom(project));
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(draftFrom(project));
    setIsEditing(false);
  }

  async function archiveProject() {
    if (window.confirm(t('archiveProjectConfirm'))) {
      await onArchive(project.id);
    }
  }

  return (
    <article className="surface-panel rounded-ui p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="grid gap-3">
              <input
                aria-label={t('projectName')}
                className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
                value={draft.name}
                onChange={(event) => update({ name: event.target.value })}
              />
              <input
                aria-label={t('projectOwner')}
                className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
                value={draft.owner}
                onChange={(event) => update({ owner: event.target.value })}
              />
              <textarea
                aria-label={t('projectSummary')}
                className="field-frame min-h-24 rounded-ui p-3 text-sm outline-none"
                value={draft.summary}
                onChange={(event) => update({ summary: event.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-500">
                  {t('status')}
                  <select
                    className="field-frame h-10 w-full min-w-0 rounded-ui px-2 text-sm font-normal text-slate-800 outline-none"
                    value={draft.status}
                    onChange={(event) => update({ status: event.target.value })}
                  >
                    {projectStatuses
                      .filter((status) => status !== 'Archived')
                      .map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status, t)}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-500">
                  {t('risk')}
                  <select
                    className="field-frame h-10 w-full min-w-0 rounded-ui px-2 text-sm font-normal text-slate-800 outline-none"
                    value={draft.risk}
                    onChange={(event) => update({ risk: event.target.value })}
                  >
                    {riskLevels.map((risk) => (
                      <option key={risk} value={risk}>
                        {riskLabel(risk, t)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-500">
                  {t('dueDate')}
                  <input
                    className="field-frame h-10 w-full min-w-0 rounded-ui px-2 text-sm font-normal text-slate-800 outline-none"
                    type="date"
                    value={draft.dueDate}
                    onChange={(event) => update({ dueDate: event.target.value })}
                  />
                </label>
                <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-500">
                  {t('progressPercent')}
                  <input
                    className="field-frame h-10 w-full min-w-0 rounded-ui px-2 text-sm font-normal text-slate-800 outline-none"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={draft.progress}
                    onChange={(event) => update({ progress: Number(event.target.value) })}
                  />
                </label>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold tracking-normal">{project.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t('owner')}: {project.owner}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t('risk')}: {riskLabel(project.risk, t)} · {formatDueDate(project.dueDate, t)}
              </p>
            </>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {statusLabel(project.status, t)}
        </span>
      </div>
      {!isEditing ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">{project.summary}</p>
      ) : null}
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-teal"
          style={{ width: `${clampProgress(project.progress)}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">
          {project.progress}% {t('complete')}
        </p>
        {canEdit ? (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  aria-label={t('save')}
                  className="primary-action inline-flex h-9 w-9 items-center justify-center rounded-ui text-white"
                  title={t('save')}
                  type="button"
                  onClick={saveProject}
                >
                  <Save size={16} aria-hidden="true" />
                </button>
                <button
                  aria-label={t('cancel')}
                  className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui"
                  title={t('cancel')}
                  type="button"
                  onClick={cancelEditing}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                aria-label={t('edit')}
                className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui"
                title={t('edit')}
                type="button"
                onClick={startEditing}
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
            )}
            <button
              aria-label={t('archive')}
              className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui text-red-700"
              title={t('archive')}
              type="button"
              onClick={archiveProject}
            >
              <Archive size={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function draftFrom(project: WorkspaceProject): ProjectUpdate {
  return {
    id: project.id,
    name: project.name,
    owner: project.owner,
    summary: project.summary,
    status: project.status,
    risk: project.risk,
    dueDate: dateInputValue(project.dueDate),
    progress: project.progress,
  };
}

function clampProgress(value: number) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0;
}
