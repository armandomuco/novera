import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { WorkspaceData } from '../../api/workspaceTypes';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice';
import type { Translate } from '../../i18n';

export function SettingsView({
  canEdit,
  data,
  onSave,
  t,
}: {
  canEdit: boolean;
  data: WorkspaceData;
  onSave: (input: { name: string; industry: string; aiProvider: string }) => Promise<void>;
  t: Translate;
}) {
  const [name, setName] = useState(data.organization.name);
  const [industry, setIndustry] = useState(data.organization.industry ?? 'Knowledge business');

  return (
    <form
      className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ name, industry, aiProvider: 'mock' });
      }}
    >
      <div className="surface-panel rounded-ui p-5">
        <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold tracking-normal">{t('organization')}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t('organizationSettingsBody')}</p>
        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">{t('organization')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            disabled={!canEdit}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">{t('industry')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            disabled={!canEdit}
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
          />
        </label>
        {canEdit ? (
          <button
            className="mt-5 h-10 primary-action rounded-ui px-4 text-sm font-semibold text-white"
            type="submit"
          >
            {t('saveChanges')}
          </button>
        ) : (
          <div className="mt-5">
            <ReadOnlyNotice t={t} />
          </div>
        )}
      </div>
      <div className="grid gap-5">
        <div className="surface-panel rounded-ui p-5">
          <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{t('aiProvider')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('aiProviderSettingsBody')}</p>
          <select
            aria-label={t('aiProvider')}
            className="mt-4 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
            value="mock"
            disabled
          >
            <option value="mock">{t('mockLocalAssistant')}</option>
          </select>
          <p className="mt-3 text-xs font-semibold leading-5 text-teal">{t('localOnlyMode')}</p>
        </div>
        <div className="surface-panel rounded-ui p-5">
          <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{t('security')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('securitySettingsBody')}</p>
        </div>
      </div>
    </form>
  );
}
