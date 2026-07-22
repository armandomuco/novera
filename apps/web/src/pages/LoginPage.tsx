import { ArrowRight, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { loginDemoUser } from '../api/demoApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { demoUsers, translate } from '../data/demoWorkspace';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('owner@novera.test');
  const [password, setPassword] = useState('DemoPass123!');
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: string) => translate(language, key);

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
      const user = email.endsWith('@novera.test')
        ? await loginDemoUser(email, password)
        : (await loginUser(email, password)).user;
      window.localStorage.setItem('novera-demo-user', JSON.stringify(user));
      navigate('/app');
    } catch {
      setMessage(t('invalidCredentials'));
    }
  }

  return (
    <main className="grid min-h-screen bg-mist text-ink lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex flex-col justify-between border-r border-line bg-white px-6 py-6 lg:px-10">
        <Logo />
        <div className="mt-6 lg:hidden">
          <LanguageSelector value={language} onChange={changeLanguage} />
        </div>
        <div className="mx-auto w-full max-w-md py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal">
            {t('workspaceAccess')}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal">{t('loginTitle')}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t('loginBody')}
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-ui border border-line bg-white px-3 focus-within:ring-2 focus-within:ring-signal">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <PasswordField
              hideLabel={t('hidePassword')}
              label={t('password')}
              showLabel={t('showPassword')}
              value={password}
              onChange={setPassword}
            />

            {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
              type="submit"
            >
              {t('continue')}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            {t('noWorkspaceYet')}{' '}
            <Link className="font-semibold text-teal hover:text-teal-700" to="/signup">
              {t('createDemoWorkspace')}
            </Link>
          </p>
        </div>
        <Link className="text-sm font-semibold text-slate-500 hover:text-ink" to="/">
          {t('backToLanding')}
        </Link>
      </section>

      <section className="hidden px-10 py-10 lg:block">
        <div className="h-full rounded-ui border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-normal">{t('demoAccounts')}</h2>
            <LanguageSelector value={language} onChange={changeLanguage} />
          </div>
          <div className="mt-5 grid gap-3">
            {demoUsers.map((user) => (
              <button
                key={user.email}
                className="flex items-center justify-between rounded-ui border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm transition hover:border-teal hover:bg-white"
                type="button"
                onClick={() => {
                  setEmail(user.email);
                  setPassword(user.password);
                }}
              >
                <span>
                  <span className="block font-semibold text-slate-700">{user.name}</span>
                  <span className="text-slate-500">{user.email}</span>
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal">
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
