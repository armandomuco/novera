import type { DashboardRisk } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import type { Translate } from '../../i18n';
import { formatDueDate, reasonLabel, riskLabel } from '../projects/projectLabels';

const severityStyle = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-50 text-amber-800',
} as const;

export function RiskPanel({
  risks,
  totalRisks,
  t,
}: {
  risks: DashboardRisk[];
  totalRisks: number;
  t: Translate;
}) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold tracking-normal">{t('currentRisks')}</h2>
        {totalRisks > risks.length ? (
          <p className="text-xs font-semibold text-slate-500">
            {risks.length} / {totalRisks}
          </p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3">
        {risks.length ? (
          risks.map((risk) => (
            <div key={`${risk.source}:${risk.entityId}`} className="quiet-panel rounded-ui p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-slate-800">{risk.title}</p>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    risk.severity ? severityStyle[risk.severity] : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {risk.severity ? riskLabel(risk.severity, t) : t('riskRecorded')}
                </span>
              </div>
              {risk.reasons.length ? (
                <p className="mt-2 flex flex-wrap gap-2">
                  {risk.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {reasonLabel(reason, t)}
                    </span>
                  ))}
                </p>
              ) : null}
              {risk.detail ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">{risk.detail}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">
                {[
                  risk.source === 'knowledge' ? risk.projectName : null,
                  risk.ownerName ? `${t('owner')}: ${risk.ownerName}` : null,
                  risk.source === 'project' ? formatDueDate(risk.dueDate, t) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          ))
        ) : (
          <EmptyState title={t('noRisksTitle')} body={t('noRisksBody')} />
        )}
      </div>
    </div>
  );
}
