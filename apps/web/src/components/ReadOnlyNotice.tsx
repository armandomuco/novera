import { LockKeyhole } from 'lucide-react';
import type { Translate } from '../i18n';

export function ReadOnlyNotice({ t }: { t: Translate }) {
  return (
    <div className="quiet-panel flex items-center gap-3 rounded-ui p-4 text-sm font-semibold text-slate-600">
      <LockKeyhole size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
      {t('readOnlyAccess')}
    </div>
  );
}
