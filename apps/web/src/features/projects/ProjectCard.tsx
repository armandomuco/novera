import { Archive, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { WorkspaceData } from '../../api/workspaceTypes';
import type { Translate } from '../../i18n';

export function ProjectCard({
  canEdit,
  onArchive,
  onUpdate,
  project,
  t,
}: {
  canEdit: boolean;
  onArchive: (projectId: string) => Promise<void>;
  onUpdate: (input: {
    id: string;
    name: string;
    owner: string;
    summary: string;
  }) => Promise<boolean>;
  project: WorkspaceData['projects'][number];
  t: Translate;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [owner, setOwner] = useState(project.owner);
  const [summary, setSummary] = useState(project.summary);

  async function saveProject() {
    if (!project.id || !name.trim() || !owner.trim() || !summary.trim()) return;
    if (await onUpdate({ id: project.id, name, owner, summary })) {
      setIsEditing(false);
    }
  }

  function cancelEditing() {
    setName(project.name);
    setOwner(project.owner);
    setSummary(project.summary);
    setIsEditing(false);
  }

  async function archiveProject() {
    if (project.id && window.confirm(t('archiveProjectConfirm'))) {
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
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                aria-label={t('projectOwner')}
                className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
              />
              <textarea
                aria-label={t('projectSummary')}
                className="field-frame min-h-24 rounded-ui p-3 text-sm outline-none"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold tracking-normal">{project.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t('owner')}: {project.owner}
              </p>
            </>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {project.status}
        </span>
      </div>
      {!isEditing ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">{project.summary}</p>
      ) : null}
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-teal" style={{ width: project.progress + '%' }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">
          {project.progress}% {t('complete')}
        </p>
        {canEdit && project.id ? (
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
                onClick={() => setIsEditing(true)}
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
