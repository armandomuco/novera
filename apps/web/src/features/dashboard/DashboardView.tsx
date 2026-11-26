import { AlertTriangle, CheckCircle2, FileText, FolderKanban, Sparkles } from 'lucide-react';
import type { DashboardPriority, WorkspaceData } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import { KnowledgeTwinCanvas } from '../../components/KnowledgeTwinCanvas';
import type { Translate, TranslationKey } from '../../i18n';
import { ProjectTable } from '../projects/ProjectTable';
import { reasonLabel, withDays } from '../projects/projectLabels';
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
  const insights = data.dashboard;
  const activeProjects = data.projects.filter((project) => project.status !== 'Archived');

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="min-w-0 space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [t('activeProjects'), String(activeProjects.length), FolderKanban],
            [t('openRisks'), String(insights?.summary.openRisks ?? 0), AlertTriangle],
            [t('recentDecisions'), String(insights?.summary.recentDecisions ?? 0), CheckCircle2],
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
            {insights?.priorities.length ? (
              <ol className="mt-5 grid gap-3 md:grid-cols-3">
                {insights.priorities.map((priority) => (
                  <PriorityCard
                    key={`${priority.kind}:${priority.entityId}`}
                    priority={priority}
                    t={t}
                  />
                ))}
              </ol>
            ) : (
              <div className="mt-5">
                <EmptyState title={t('noPrioritiesTitle')} body={t('noPrioritiesBody')} />
              </div>
            )}
          </div>
        ) : null}

        <ProjectTable onAsk={onAsk} projects={activeProjects} t={t} />
      </div>

      <div className="min-w-0 space-y-5">
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
        <RiskPanel
          risks={insights?.risks ?? []}
          totalRisks={insights?.summary.openRisks ?? 0}
          t={t}
        />
      </div>
    </div>
  );
}

const priorityStyle: Record<DashboardPriority['kind'], string> = {
  overdue_project: 'text-red-700',
  at_risk_project: 'text-amber-800',
  due_soon_project: 'text-teal',
  recent_decision: 'text-blue-800',
};

function PriorityCard({ priority, t }: { priority: DashboardPriority; t: Translate }) {
  const context =
    priority.kind === 'recent_decision'
      ? priority.projectName
      : priority.ownerName
        ? `${t('owner')}: ${priority.ownerName}`
        : null;
  return (
    <li className="quiet-panel rounded-ui p-4">
      <p className={`text-xs font-semibold ${priorityStyle[priority.kind]}`}>
        {priorityReason(priority, t)}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{priority.title}</p>
      {context ? <p className="mt-2 text-sm leading-6 text-slate-600">{context}</p> : null}
    </li>
  );
}

function priorityReason(priority: DashboardPriority, t: Translate) {
  const days = priority.days ?? 0;
  const phrase = (zero: TranslationKey | null, one: TranslationKey, many: TranslationKey) =>
    days === 0 && zero ? t(zero) : days === 1 ? t(one) : withDays(t(many), days);

  switch (priority.kind) {
    case 'overdue_project':
      return phrase(null, 'priorityOverdueOne', 'priorityOverdueMany');
    case 'due_soon_project':
      return phrase('priorityDueToday', 'priorityDueTomorrow', 'priorityDueInMany');
    case 'recent_decision':
      return phrase('priorityDecisionToday', 'priorityDecisionYesterday', 'priorityDecisionMany');
    case 'at_risk_project':
      return priority.reasons.map((reason) => reasonLabel(reason, t)).join(' · ');
  }
}
