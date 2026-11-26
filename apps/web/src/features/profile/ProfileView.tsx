import { UserCircle } from 'lucide-react';
import { useState } from 'react';
import { requestEmailVerification } from '../../api/authApi';
import type { ApiUser } from '../../api/workspaceTypes';
import type { Translate } from '../../i18n';

export function ProfileView({
  currentUser,
  onSave,
  t,
}: {
  currentUser: ApiUser;
  onSave: (name: string) => void;
  t: Translate;
}) {
  const [name, setName] = useState(currentUser.name);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  async function createVerificationLink() {
    setVerificationMessage('');
    try {
      const result = await requestEmailVerification();
      if (result.alreadyVerified) {
        setVerificationMessage(t('emailAlreadyVerified'));
      } else if (result.previewUrl) {
        setVerificationUrl(result.previewUrl);
        setVerificationMessage(t('verificationLinkReady'));
      } else {
        setVerificationMessage(t('verificationRequestSent'));
      }
    } catch {
      setVerificationMessage(t('verificationRequestFailed'));
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="surface-panel rounded-ui p-5">
        <UserCircle className="text-teal" size={42} aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold tracking-normal">{currentUser.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{currentUser.email}</p>
        <p className="mt-4 rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">
          {currentUser.role}
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">{t('profileAccessDescription')}</p>
      </div>
      <form
        className="surface-panel rounded-ui p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(name);
        }}
      >
        <h2 className="text-2xl font-bold tracking-normal">{t('profile')}</h2>
        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">{t('name')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            type="email"
            value={currentUser.email}
            readOnly
          />
          <span className="mt-2 block text-xs font-medium text-slate-500">
            {t('emailChangeLater')}
          </span>
        </label>
        <button
          className="mt-5 h-10 primary-action rounded-ui px-4 text-sm font-semibold text-white"
          type="submit"
        >
          {t('saveChanges')}
        </button>
        <div className="mt-6 border-t border-line pt-5">
          <p className="text-sm font-bold text-slate-800">{t('emailVerification')}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{t('emailVerificationBody')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              className="secondary-action h-10 rounded-ui px-4 text-sm font-semibold"
              onClick={createVerificationLink}
              type="button"
            >
              {t('requestVerification')}
            </button>
            {verificationUrl ? (
              <a
                className="text-sm font-semibold text-teal hover:text-teal-700"
                href={verificationUrl}
              >
                {t('openVerificationLink')}
              </a>
            ) : null}
          </div>
          {verificationMessage ? (
            <p className="mt-3 text-sm font-medium text-slate-600">{verificationMessage}</p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
