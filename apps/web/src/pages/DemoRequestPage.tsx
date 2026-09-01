import { ArrowRight, Clock, Mail, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestDemo } from '../api/demoRequestApi';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { translate } from '../data/demoWorkspace';

const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

export function DemoRequestPage() {
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    companySize: '11-50',
    useCase: '',
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = (key: string) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  async function submitDemoRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    try {
      const result = await requestDemo(form);
      const expiration = new Date(result.requestedDemoExpiresAt).toLocaleDateString();
      setStatus(`${t('demoRequestSuccess')} ${t('demoRequestExpires')} ${expiration}. ${t('demoRequestSupport')} ${result.supportEmail}.`);
    } catch {
      setStatus(t('demoRequestFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-canvas min-h-screen px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSelector value={language} onChange={changeLanguage} />
          <Link className="text-sm font-semibold text-slate-600 hover:text-ink" to="/login">
            {t('login')}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="status-pill inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">{t('requestDemo')}</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-normal">{t('demoRequestTitle')}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{t('demoRequestBody')}</p>
          <div className="mt-6 grid gap-3">
            {[
              [Clock, t('fiveDayDemo')],
              [ShieldCheck, t('demoReviewedManually')],
              [Mail, t('demoRequestEmailNote')],
            ].map(([Icon, label]) => (
              <div key={label as string} className="quiet-panel flex items-center gap-3 rounded-ui p-4">
                <Icon className="text-teal" size={20} aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-700">{label as string}</span>
              </div>
            ))}
          </div>
        </div>

        <form className="surface-panel rounded-ui p-6" onSubmit={submitDemoRequest}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fullName')} value={form.name} placeholder="Alex Morgan" onChange={(name) => setForm({ ...form, name })} />
            <Field label={t('workEmail')} type="email" value={form.email} placeholder="alex@company.com" onChange={(email) => setForm({ ...form, email })} />
            <Field label={t('company')} value={form.company} placeholder="Northstar Consulting" onChange={(company) => setForm({ ...form, company })} />
            <Field label={t('role')} value={form.role} placeholder="Founder, COO, Delivery Manager" onChange={(role) => setForm({ ...form, role })} />
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t('companySize')}</span>
              <select
                className="field-frame mt-2 h-11 w-full rounded-ui px-3 text-sm outline-none"
                value={form.companySize}
                onChange={(event) => setForm({ ...form, companySize: event.target.value })}
              >
                {companySizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">{t('mainUseCase')}</span>
              <textarea
                className="field-frame mt-2 min-h-28 w-full rounded-ui px-3 py-3 text-sm outline-none"
                placeholder={t('mainUseCasePlaceholder')}
                value={form.useCase}
                onChange={(event) => setForm({ ...form, useCase: event.target.value })}
              />
            </label>
          </div>

          {status ? <p className="mt-4 rounded-ui bg-teal/10 p-3 text-sm font-semibold text-teal">{status}</p> : null}

          <button
            className="primary-action mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? t('sending') : t('submitDemoRequest')}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="field-frame mt-2 h-11 w-full rounded-ui px-3 text-sm outline-none"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
