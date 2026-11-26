import type { RiskReason } from '../../api/workspaceTypes';
import type { Translate, TranslationKey } from '../../i18n';

const statusLabels: Record<string, TranslationKey> = {
  Planning: 'statusPlanning',
  Active: 'statusActive',
  'On track': 'statusOnTrack',
  Review: 'statusReview',
  Delayed: 'statusDelayed',
  Archived: 'statusArchived',
};

const riskLabels: Record<string, TranslationKey> = {
  Low: 'riskLow',
  Medium: 'riskMedium',
  High: 'riskHigh',
};

const reasonLabels: Record<RiskReason, TranslationKey> = {
  overdue: 'riskReasonOverdue',
  delayed: 'statusDelayed',
  high_risk: 'riskReasonHighRisk',
};

/** Stored values are English; unknown values are shown as stored. */
export function statusLabel(status: string, t: Translate) {
  const key = statusLabels[status];
  return key ? t(key) : status;
}

export function riskLabel(risk: string, t: Translate) {
  const key = riskLabels[risk];
  return key ? t(key) : risk;
}

export function reasonLabel(reason: RiskReason, t: Translate) {
  return t(reasonLabels[reason]);
}

/** Due dates are stored as midnight UTC, so format them in UTC to keep the calendar day. */
export function formatDueDate(isoDate: string | null, t: Translate) {
  if (!isoDate) return t('noDueDate');
  return new Date(isoDate).toLocaleDateString(undefined, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** The value a date input expects ("YYYY-MM-DD"). */
export function dateInputValue(isoDate: string | null) {
  return isoDate ? isoDate.slice(0, 10) : '';
}

/** Fills "{days}" in a translated phrase. */
export function withDays(text: string, days: number) {
  return text.replace('{days}', String(days));
}
