import type { WorkspaceProject } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import type { Translate } from '../../i18n';
import { formatDueDate, riskLabel, statusLabel } from './projectLabels';

export function ProjectTable({
  onAsk,
  projects,
  t,
}: {
  onAsk: (question: string) => void;
  projects: WorkspaceProject[];
  t: Translate;
}) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <h2 className="text-lg font-bold tracking-normal">{t('activeProjects')}</h2>
      <div className="table-surface mt-4 overflow-x-auto rounded-ui">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('project')}</th>
              <th className="px-4 py-3 font-semibold">{t('status')}</th>
              <th className="px-4 py-3 font-semibold">{t('risk')}</th>
              <th className="px-4 py-3 font-semibold">{t('owner')}</th>
              <th className="px-4 py-3 font-semibold">{t('dueDate')}</th>
              <th className="px-4 py-3 font-semibold">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{project.name}</td>
                <td className="px-4 py-3 text-slate-600">{statusLabel(project.status, t)}</td>
                <td className="px-4 py-3 text-slate-600">{riskLabel(project.risk, t)}</td>
                <td className="px-4 py-3 text-slate-600">{project.owner}</td>
                <td className="px-4 py-3 text-slate-600">{formatDueDate(project.dueDate, t)}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-sm font-semibold text-teal hover:text-teal-700"
                    type="button"
                    onClick={() => onAsk(`Why is ${project.name} ${project.status.toLowerCase()}?`)}
                  >
                    {t('askWhy')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!projects.length ? (
        <div className="mt-4">
          <EmptyState title={t('noProjectsTitle')} body={t('noProjectsBody')} />
        </div>
      ) : null}
    </div>
  );
}
