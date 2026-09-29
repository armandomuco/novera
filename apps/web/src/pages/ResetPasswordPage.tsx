import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { completePasswordReset } from '../api/authApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { translate } from '../data/demoWorkspace';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: string) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = searchParams.get('token') ?? '';
    if (password !== confirmation) {
      setMessage(t('passwordMismatch'));
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      await completePasswordReset(token, password);
      setComplete(true);
    } catch {
      setMessage(t('resetFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-canvas min-h-screen px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Logo />
        <LanguageSelector value={language} onChange={changeLanguage} label={t('selectLanguage')} />
      </header>
      <section className="mx-auto max-w-md py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal">
          {t('security')}
        </p>
        <h1 className="mt-3 text-3xl font-bold">{t('resetPasswordTitle')}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t('resetPasswordBody')}</p>
        {complete ? (
          <div className="mt-8 space-y-5">
            <div className="quiet-panel rounded-ui p-4 text-sm font-semibold text-slate-700">
              {t('resetComplete')}
            </div>
            <Link
              className="primary-action inline-flex h-11 w-full items-center justify-center rounded-ui px-5 text-sm font-semibold text-white"
              to="/login"
            >
              {t('backToLogin')}
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <PasswordField
              hideLabel={t('hidePassword')}
              label={t('newPassword')}
              autoComplete="new-password"
              placeholder={t('minimumPassword')}
              showLabel={t('showPassword')}
              value={password}
              onChange={setPassword}
            />
            <PasswordField
              hideLabel={t('hidePassword')}
              label={t('confirmPassword')}
              autoComplete="new-password"
              placeholder={t('minimumPassword')}
              showLabel={t('showPassword')}
              value={confirmation}
              onChange={setConfirmation}
            />
            {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}
            <button
              className="primary-action inline-flex h-11 w-full items-center justify-center rounded-ui px-5 text-sm font-semibold text-white"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t('saving') : t('resetPassword')}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
