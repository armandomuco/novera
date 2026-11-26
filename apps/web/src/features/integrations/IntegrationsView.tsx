import { Plug } from 'lucide-react';
import type { Translate } from '../../i18n';

export function IntegrationsView({ t }: { t: Translate }) {
  const integrations = [
    'Gmail',
    'Google Drive',
    'Slack',
    'GitHub',
    'Notion',
    'Jira',
    'Microsoft Teams',
    'Trello',
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {integrations.map((integration) => (
        <div key={integration} className="surface-panel rounded-ui p-5">
          <Plug className="text-signal" size={22} aria-hidden="true" />
          <div className="mt-4 flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold tracking-normal">{integration}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {t('planned')}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('integrationPrepared')}</p>
          <p className="mt-4 border-l-2 border-teal pl-3 text-xs font-semibold leading-5 text-teal">
            {t('integrationLocalOnly')}
          </p>
        </div>
      ))}
    </div>
  );
}
