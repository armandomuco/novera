import { AlertTriangle, CheckCircle2, FileText, FolderKanban, Sparkles } from 'lucide-react';
import type { WorkspaceData } from '../../api/workspaceTypes';
import { KnowledgeTwinCanvas } from '../../components/KnowledgeTwinCanvas';
import type { Translate } from '../../i18n';
import { ProjectTable } from '../projects/ProjectTable';
import { RiskPanel } from './RiskPanel';

export function DashboardView({
  data,
  onAsk,
  t,
}: {
  data: WorkspaceData;
  onAsk: (question: string) => void;
  t: Translate;
}) {
  const hasWorkspaceSignal =
    data.projects.length + data.knowledgeItems.length + data.documents.length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [t('activeProjects'), String(data.projects.length), FolderKanban],
            [t('openRisks'), String(data.risks.length), AlertTriangle],
            [
              t('recentDecisions'),
              String(data.knowledgeItems.filter((item) => item.type === 'Decision').length),
              CheckCircle2,
            ],
            [t('documents'), String(data.documents.length), FileText],
          ].map(([label, value, Icon]) => (
            <div
              key={label as string}
              className="surface-panel rounded-ui p-4 transition hover:-translate-y-0.5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-ui bg-teal/10">
                <Icon className="text-teal" size={20} aria-hidden="true" />
              </span>
              <p className="mt-3 text-2xl font-bold">{value as string}</p>
              <p className="text-sm text-slate-500">{label as string}</p>
            </div>
          ))}
        </div>

        {!hasWorkspaceSignal ? (
          <div className="surface-panel overflow-hidden rounded-ui p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-sm font-semibold text-teal">{t('emptyWorkspaceEyebrow')}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal">
                  {t('emptyWorkspaceTitle')}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {t('emptyWorkspaceBody')}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="primary-action inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
                    type="button"
                    onClick={() =>
                      onAsk('What information should we add first to build this company twin?')
                    }
                  >
                    <Sparkles size={16} aria-hidden="true" />
                    {t('planFirstWorkspace')}
                  </button>
                  <button
                    className="secondary-action inline-flex h-10 items-center rounded-ui px-4 text-sm font-semibold"
                    type="button"
                    onClick={() =>
                      onAsk('What should management focus on this week with no workspace data yet?')
                    }
                  >
                    {t('askReadinessQuestion')}
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                {(['emptyStepProject', 'emptyStepKnowledge', 'emptyStepDocument'] as const).map(
                  (step, index) => (
                    <div key={step} className="quiet-panel flex gap-3 rounded-ui p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-ui bg-teal/10 text-sm font-bold text-teal">
                        {index + 1}
                      </span>
                      <p className="text-sm font-semibold leading-6 text-slate-700">{t(step)}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : null}

        {hasWorkspaceSignal ? (
          <div className="surface-panel rounded-ui p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-teal">{t('managementPriorities')}</p>
                <h2 className="mt-1 text-2xl font-bold tracking-normal">{t('thisWeek')}</h2>
              </div>
              <button
                className="primary-action inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
                type="button"
                onClick={() => onAsk('What should management focus on this week?')}
              >
                <Sparkles size={16} aria-hidden="true" />
                {t('explainPriorities')}
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {(
                [
                  'priorityAtlasCredentials',
                  'priorityRetainerScope',
                  'priorityFinancePermissions',
                ] as const
              ).map((priority) => (
                <div key={priority} className="quiet-panel rounded-ui p-4">
                  <p className="text-sm font-semibold text-slate-800">{t(priority)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t('linkedToActivity')}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <ProjectTable onAsk={onAsk} projects={data.projects} t={t} />
      </div>

      <div className="space-y-5">
        <KnowledgeTwinCanvas
          domainLabels={[
            t('projects'),
            t('docs'),
            t('decisions'),
            t('currentRisks'),
            t('team'),
            t('customers'),
          ]}
          linkedDomainsLabel={t('domainsLinked')}
          liveContextLabel={t('liveContext')}
          title={t('businessTwin')}
          subtitle={t('liveKnowledgeMap')}
        />
        <RiskPanel risks={data.risks} t={t} />
      </div>
    </div>
  );
}
