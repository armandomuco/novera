import { ArrowRight, Building2, Mail, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { translate } from '../data/demoWorkspace';

export function SignupPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const t = (key: string) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await registerUser({ name, email, password, organizationName });
      navigate('/app');
    } catch {
      setMessage(t('signupFailed'));
    }
  }

  return (
    <main className="page-canvas min-h-screen px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSelector
            value={language}
            onChange={changeLanguage}
            label={t('selectLanguage')}
          />
          <Link className="text-sm font-semibold text-slate-600 hover:text-ink" to="/login">
            {t('login')}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="status-pill inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
            {t('startWorkspace')}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal">{t('signupTitle')}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{t('signupBody')}</p>
        </div>

        <form className="surface-panel rounded-ui p-6" autoComplete="off" onSubmit={handleSubmit}>
          <div className="grid gap-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('fullName')}</span>
              <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
                <User size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  autoComplete="off"
                  placeholder="Alex Morgan"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('workEmail')}</span>
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

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('organization')}</span>
              <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
                <Building2 size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  autoComplete="off"
                  placeholder="Northstar Consulting"
                  type="text"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                />
              </span>
            </label>

            <PasswordField
              hideLabel={t('hidePassword')}
              label={t('password')}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              showLabel={t('showPassword')}
              value={password}
              onChange={setPassword}
            />

            {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}

            <button
              className="primary-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui px-5 text-sm font-semibold text-white transition"
              onClick={() => setMessage('')}
              type="submit"
            >
              {t('createWorkspace')}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
