import type { WorkspaceData } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import type { Translate } from '../../i18n';

export function ActivityView({ data, t }: { data: WorkspaceData; t: Translate }) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <h2 className="text-2xl font-bold tracking-normal">{t('activityTimeline')}</h2>
      <div className="mt-5 grid gap-3">
        {data.activities.length ? (
          data.activities.map((item) => (
            <div key={`${item.actor}-${item.target}`} className="quiet-panel rounded-ui p-4">
              <p className="text-sm font-semibold text-slate-800">
                {item.actor} {item.action}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.target}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">{item.time}</p>
            </div>
          ))
        ) : (
          <EmptyState title={t('noActivityTitle')} body={t('noActivityBody')} />
        )}
      </div>
    </div>
  );
}
