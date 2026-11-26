import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { translate, type TranslationKey } from '../i18n';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: TranslationKey) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setMessage(t('enterEmailPassword'));
      return;
    }

    try {
      const user = (await loginUser(email, password)).user;
      window.localStorage.setItem('novera-demo-user', JSON.stringify(user));
      navigate('/app');
    } catch {
      setMessage(t('invalidCredentials'));
    }
  }

  return (
    <main className="page-canvas grid min-h-screen text-ink lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex flex-col justify-between border-r border-line bg-white/92 px-6 py-6 shadow-sm lg:px-10">
        <Logo />
        <div className="mt-6 lg:hidden">
          <LanguageSelector
            value={language}
            onChange={changeLanguage}
            label={t('selectLanguage')}
          />
        </div>
        <div className="mx-auto w-full max-w-md py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal">
            {t('workspaceAccess')}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal">{t('loginTitle')}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{t('loginBody')}</p>

          <form className="mt-8 space-y-5" autoComplete="off" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
              <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  autoComplete="off"
                  placeholder="alex@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <PasswordField
              hideLabel={t('hidePassword')}
              label={t('password')}
              autoComplete="new-password"
              placeholder={t('currentPassword')}
              showLabel={t('showPassword')}
              value={password}
              onChange={setPassword}
            />

            <div className="text-right">
              <Link
                className="text-sm font-semibold text-teal hover:text-teal-700"
                to="/forgot-password"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}

            <button
              className="primary-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui px-5 text-sm font-semibold text-white transition"
              type="submit"
            >
              {t('continue')}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            {t('noWorkspaceYet')}{' '}
            <Link className="font-semibold text-teal hover:text-teal-700" to="/signup">
              {t('signup')}
            </Link>
          </p>
          <p className="mt-3 text-sm text-slate-600">
            {t('wantDemo')}{' '}
            <Link className="font-semibold text-teal hover:text-teal-700" to="/request-demo">
              {t('requestDemo')}
            </Link>
          </p>
        </div>
        <Link className="text-sm font-semibold text-slate-500 hover:text-ink" to="/">
          {t('backToLanding')}
        </Link>
      </section>

      <section className="hidden px-10 py-10 lg:block">
        <div className="surface-panel flex h-full flex-col justify-between rounded-ui p-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold tracking-normal">{t('accessByApproval')}</h2>
              <LanguageSelector
                value={language}
                onChange={changeLanguage}
                label={t('selectLanguage')}
              />
            </div>
            <div className="mt-6 grid gap-4">
              {[t('fiveDayDemo'), t('demoReviewedManually'), t('tenantSafe')].map((item) => (
                <div
                  key={item}
                  className="quiet-panel rounded-ui p-4 text-sm font-semibold text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="quiet-panel mt-6 rounded-ui p-4">
              <p className="text-sm font-bold text-slate-800">{t('demoAccessProcess')}</p>
              <div className="mt-4 grid gap-3">
                {(['demoProcessRequest', 'demoProcessApprove', 'demoProcessExpire'] as const).map(
                  (item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 text-teal" size={17} aria-hidden="true" />
                      <p className="text-sm leading-6 text-slate-600">{t(item)}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <Link
            className="primary-action mt-6 inline-flex h-10 items-center justify-center rounded-ui px-4 text-sm font-semibold text-white"
            to="/request-demo"
          >
            {t('requestDemo')}
          </Link>
        </div>
      </section>
    </main>
  );
}
