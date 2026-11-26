import { type FormEvent, useState } from 'react';
import type { ProjectUpdate, WorkspaceData } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice';
import type { Translate } from '../../i18n';
import { ProjectCard } from './ProjectCard';
import { ProjectTable } from './ProjectTable';

export function ProjectsView({
  canEdit,
  data,
  onArchiveProject,
  onAsk,
  onCreateProject,
  onUpdateProject,
  t,
}: {
  canEdit: boolean;
  data: WorkspaceData;
  onArchiveProject: (projectId: string) => Promise<void>;
  onAsk: (question: string) => void;
  onCreateProject: (input: { name: string; owner: string; summary: string }) => Promise<boolean>;
  onUpdateProject: (input: ProjectUpdate) => Promise<boolean>;
  t: Translate;
}) {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [summary, setSummary] = useState('');

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onCreateProject({ name, owner, summary })) {
      setName('');
      setOwner('');
      setSummary('');
    }
  }

  return (
    <div className="space-y-5">
      {canEdit ? (
        <form className="surface-panel rounded-ui p-5" onSubmit={submitProject}>
          <h2 className="text-lg font-bold tracking-normal">{t('createProject')}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.6fr_1.2fr_auto]">
            <input
              className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
              aria-label={t('projectName')}
              placeholder={t('projectNamePlaceholder')}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
              aria-label={t('projectOwner')}
              placeholder={t('projectOwnerPlaceholder')}
              required
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            />
            <input
              className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
              aria-label={t('projectSummary')}
              placeholder={t('projectSummaryPlaceholder')}
              required
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
            <button
              className="primary-action h-10 rounded-ui px-4 text-sm font-semibold text-white"
              type="submit"
            >
              {t('create')}
            </button>
          </div>
        </form>
      ) : (
        <ReadOnlyNotice t={t} />
      )}
      <ProjectTable onAsk={onAsk} projects={data.projects} t={t} />
      <div className="grid gap-4 lg:grid-cols-3">
        {data.projects.length ? (
          data.projects.map((project) => (
            <ProjectCard
              key={project.id}
              canEdit={canEdit}
              onArchive={onArchiveProject}
              onUpdate={onUpdateProject}
              project={project}
              t={t}
            />
          ))
        ) : (
          <EmptyState title={t('noProjectsTitle')} body={t('noProjectsBody')} />
        )}
      </div>
    </div>
  );
}
