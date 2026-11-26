import { ArrowRight, Building2, CheckCircle2, Mail, ShieldCheck, User } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation, getInvitationDetails, InvitationDetails } from '../api/authApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { translate, type TranslationKey } from '../i18n';

export function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: TranslationKey) => translate(language, key);

  useEffect(() => {
    if (!token) {
      setMessage(t('invitationInvalid'));
      return;
    }
    getInvitationDetails(token)
      .then(setDetails)
      .catch(() => setMessage(t('invitationInvalid')));
  }, [token]);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!details || !password || (!details.accountExists && !name.trim())) {
      setMessage(t('invitationFieldsRequired'));
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      await acceptInvitation({ token, name: details.accountExists ? undefined : name, password });
      navigate('/app');
    } catch {
      setMessage(t('invitationAcceptFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-canvas min-h-screen px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Logo />
        <LanguageSelector value={language} onChange={changeLanguage} label={t('selectLanguage')} />
      </header>
      <section className="mx-auto grid max-w-5xl gap-8 py-12 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="status-pill inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
            {t('workspaceInvitation')}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-normal">{t('joinWorkspace')}</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            {t('joinWorkspaceBody')}
          </p>
          {details ? (
            <div className="quiet-panel mt-7 grid gap-4 rounded-ui p-5">
              <div className="flex items-center gap-3">
                <Building2 className="text-teal" size={20} aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">{t('organization')}</p>
                  <p className="font-bold">{details.organization.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-signal" size={20} aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">{t('role')}</p>
                  <p className="font-bold">{details.role}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <form className="surface-panel rounded-ui p-6" onSubmit={submit}>
          {details ? (
            <div className="grid gap-5">
              <div className="flex items-center gap-3 rounded-ui border border-teal/20 bg-teal-50 p-4">
                <CheckCircle2 className="text-teal" size={20} aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{details.email}</p>
                  <p className="text-xs text-slate-600">
                    {details.accountExists
                      ? t('existingAccountInvitation')
                      : t('newAccountInvitation')}
                  </p>
                </div>
              </div>
              {!details.accountExists ? (
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">{t('fullName')}</span>
                  <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
                    <User size={18} className="text-slate-400" aria-hidden="true" />
                    <input
                      className="w-full border-0 bg-transparent text-sm outline-none"
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </span>
                </label>
              ) : null}
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
                <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
                  <Mail size={18} className="text-slate-400" aria-hidden="true" />
                  <input
                    className="w-full border-0 bg-transparent text-sm text-slate-500 outline-none"
                    disabled
                    value={details.email}
                  />
                </span>
              </label>
              <PasswordField
                hideLabel={t('hidePassword')}
                label={t('password')}
                autoComplete={details.accountExists ? 'current-password' : 'new-password'}
                placeholder={details.accountExists ? t('currentPassword') : t('minimumPassword')}
                showLabel={t('showPassword')}
                value={password}
                onChange={setPassword}
              />
              {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
              <button
                className="primary-action inline-flex h-11 items-center justify-center gap-2 rounded-ui px-5 text-sm font-semibold text-white"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? t('joining') : t('acceptAndJoin')}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-600">
                {message || t('checkingInvitation')}
              </p>
              {message ? (
                <Link className="mt-5 inline-flex text-sm font-semibold text-teal" to="/login">
                  {t('backToLogin')}
                </Link>
              ) : null}
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
