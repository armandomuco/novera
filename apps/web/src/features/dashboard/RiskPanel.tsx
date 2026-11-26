import type { WorkspaceData } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import type { Translate } from '../../i18n';

export function RiskPanel({ risks, t }: { risks: WorkspaceData['risks']; t: Translate }) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <h2 className="text-lg font-bold tracking-normal">{t('currentRisks')}</h2>
      <div className="mt-4 grid gap-3">
        {risks.length ? (
          risks.map((risk) => (
            <div key={risk.title} className="quiet-panel rounded-ui p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-800">{risk.title}</p>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {risk.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
            </div>
          ))
        ) : (
          <EmptyState title={t('noRisksTitle')} body={t('noRisksBody')} />
        )}
      </div>
    </div>
  );
}
