import { ArrowRight, Building2, Mail, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { demoUsers, translate } from '../data/demoWorkspace';

export function SignupPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const [name, setName] = useState('Olivia Stone');
  const [email, setEmail] = useState('owner@novera.test');
  const [organizationName, setOrganizationName] = useState('Acme Studio');
  const [password, setPassword] = useState('DemoPass123!');
  const t = (key: string) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (email.endsWith('@novera.test')) {
        window.localStorage.setItem('novera-demo-user', JSON.stringify(demoUsers[0]));
      } else {
        await registerUser({ name, email, password, organizationName });
      }
      navigate('/app');
    } catch {
      setMessage(t('signupFailed'));
    }
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSelector value={language} onChange={changeLanguage} />
          <Link className="text-sm font-semibold text-slate-600 hover:text-ink" to="/login">
            {t('login')}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal">
            {t('startWorkspace')}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal">{t('signupTitle')}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            {t('signupBody')}
          </p>
        </div>

        <form
          className="rounded-ui border border-line bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('fullName')}</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-ui border border-line bg-white px-3 focus-within:ring-2 focus-within:ring-signal">
                <User size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('workEmail')}</span>
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

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('organization')}</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-ui border border-line bg-white px-3 focus-within:ring-2 focus-within:ring-signal">
                <Building2 size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  type="text"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
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
              onClick={() => setMessage('')}
              type="submit"
            >
              {t('createDemoWorkspace')}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
