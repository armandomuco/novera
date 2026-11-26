import type { Translate } from '../../i18n';

export function knowledgeTypeOptions(t: Translate) {
  return [
    { value: 'decision', label: t('typeDecision') },
    { value: 'note', label: t('typeNote') },
    { value: 'meeting_summary', label: t('typeMeeting') },
    { value: 'project_update', label: t('typeProjectUpdate') },
    { value: 'customer_information', label: t('typeCustomerInformation') },
    { value: 'process', label: t('typeProcess') },
    { value: 'risk', label: t('typeRisk') },
  ];
}
