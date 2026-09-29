import { ArrowRight, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/authApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { translate } from '../data/demoWorkspace';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: string) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      setPreviewUrl(result.previewUrl ?? '');
      setSubmitted(true);
    } catch {
      setMessage(t('resetRequestFailed'));
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
        <h1 className="mt-3 text-3xl font-bold">{t('forgotPasswordTitle')}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t('forgotPasswordBody')}</p>

        {submitted ? (
          <div className="mt-8 space-y-4">
            <div className="quiet-panel rounded-ui p-4 text-sm leading-6 text-slate-700">
              {t('resetRequestSent')}
            </div>
            {previewUrl ? (
              <a
                className="primary-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui px-5 text-sm font-semibold text-white"
                href={previewUrl}
              >
                {t('openDevelopmentResetLink')}
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
              <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  autoComplete="email"
                  placeholder="alex@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>
            {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}
            <button
              className="primary-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui px-5 text-sm font-semibold text-white"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t('sending') : t('sendResetLink')}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
        )}
        <Link
          className="mt-6 inline-block text-sm font-semibold text-slate-600 hover:text-ink"
          to="/login"
        >
          {t('backToLogin')}
        </Link>
      </section>
    </main>
  );
}
