import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/authApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { translate, type TranslationKey } from '../i18n';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: TranslationKey) => translate(language, key);

  useEffect(() => {
    const token = searchParams.get('token') ?? '';
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  return (
    <main className="page-canvas min-h-screen px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Logo />
        <LanguageSelector value={language} onChange={changeLanguage} label={t('selectLanguage')} />
      </header>
      <section className="mx-auto max-w-md py-20 text-center">
        {status === 'success' ? (
          <CheckCircle2 className="mx-auto text-teal" size={38} aria-hidden="true" />
        ) : null}
        <h1 className="mt-4 text-3xl font-bold">
          {status === 'loading'
            ? t('verifyingEmail')
            : status === 'success'
              ? t('emailVerified')
              : t('verificationUnavailable')}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {status === 'loading'
            ? t('verifyingEmailBody')
            : status === 'success'
              ? t('emailVerifiedBody')
              : t('verificationUnavailableBody')}
        </p>
        {status !== 'loading' ? (
          <Link
            className="primary-action mt-8 inline-flex h-11 items-center justify-center rounded-ui px-5 text-sm font-semibold text-white"
            to={status === 'success' ? '/app' : '/login'}
          >
            {status === 'success' ? t('continueToWorkspace') : t('backToLogin')}
          </Link>
        ) : null}
      </section>
    </main>
  );
}
