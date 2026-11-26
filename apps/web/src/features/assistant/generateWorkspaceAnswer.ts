import type { WorkspaceData } from '../../api/workspaceTypes';
import type { Translate } from '../../i18n';

export function generateWorkspaceAnswer(question: string, data: WorkspaceData, t: Translate) {
  const normalized = question.toLowerCase();
  const includesAny = (terms: string[]) => terms.some((term) => normalized.includes(term));
  const delayedProject = data.projects.find((project) =>
    [project.name, project.status, project.summary].join(' ').toLowerCase().includes('delayed'),
  );
  const matchedProject =
    data.projects.find((project) => normalized.includes(project.name.toLowerCase())) ??
    delayedProject;
  const relatedKnowledge = data.knowledgeItems.filter((item) =>
    matchedProject
      ? item.project === matchedProject.name
      : normalized.includes(item.type.toLowerCase()),
  );
  const recentActivity = data.activities.slice(0, 3);

  if (!data.projects.length && !data.knowledgeItems.length && !data.documents.length) {
    return t('assistantNoInformation');
  }

  if (
    includesAny([
      'delayed',
      'delay',
      'why',
      'vonuar',
      'pse',
      'ritardo',
      'perché',
      'verzögert',
      'warum',
      'retard',
      'pourquoi',
    ])
  ) {
    if (!matchedProject) {
      return t('assistantNoInformation');
    }
    return [
      `${matchedProject.name}: ${matchedProject.summary || t('assistantLimitedProjectContext')}`,
      `${t('status')}: ${matchedProject.status}. ${t('risk')}: ${matchedProject.risk}. ${t('owner')}: ${matchedProject.owner}.`,
      relatedKnowledge.length
        ? `${t('supportingSources')}: ${relatedKnowledge.map((item) => item.title).join(', ')}.`
        : t('assistantLimitedSources'),
    ].join(' ');
  }

  if (includesAny(['decision', 'vendim', 'decisione', 'entscheidung', 'décision'])) {
    const decisions = data.knowledgeItems.filter((item) =>
      item.type.toLowerCase().includes('decision'),
    );
    if (!decisions.length) {
      return t('assistantNoInformation');
    }
    return `${t('recentDecisions')}: ${decisions.map((item) => `${item.title} (${item.project})`).join('; ')}. ${t('assistantGroundingNote')}`;
  }

  if (
    includesAny([
      'risk',
      'focus',
      'week',
      'rrezik',
      'fokusohet',
      'javë',
      'rischio',
      'concentrarsi',
      'settimana',
      'risiko',
      'konzentrieren',
      'woche',
      'risque',
      'concentrer',
      'semaine',
    ])
  ) {
    const riskSummary = data.risks.length
      ? data.risks.map((risk) => `${risk.title}: ${risk.mitigation}`).join('; ')
      : t('assistantNoRisksRecorded');
    const projectSummary = data.projects
      .slice(0, 3)
      .map((project) => `${project.name} (${project.status})`)
      .join(', ');
    return `${t('managementFocus')}: ${projectSummary || t('assistantNoProjectsRecorded')}. ${riskSummary}. ${t('assistantGroundingNote')}`;
  }

  if (includesAny(['document', 'dokumenti', 'documento', 'dokument'])) {
    const latestDocument = data.documents[0];
    return latestDocument
      ? `${t('document')}: ${latestDocument.title} (${latestDocument.type}, ${latestDocument.status}). ${t('assistantGroundingNote')}`
      : t('assistantNoInformation');
  }

  if (recentActivity.length) {
    return `${t('activityTimeline')}: ${recentActivity.map((event) => `${event.actor} ${event.action} ${event.target}`).join('; ')}. ${t('assistantGroundingNote')}`;
  }

  return t('assistantNoInformation');
}
