import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { translate } from '../data/demoWorkspace';

const plans = [
  {
    name: 'Starter',
    price: '€99',
    period: '/month',
    description: 'For small teams starting with shared business memory.',
    features: ['1 organization', 'Up to 10 users', 'Manual knowledge items', 'Projects and activity timeline', 'Basic assistant answers'],
  },
  {
    name: 'Growth',
    price: '€249',
    period: '/month',
    description: 'For agencies, consultancies, and software teams managing multiple projects.',
    featured: true,
    features: ['Up to 40 users', 'Documents and summaries', 'Hybrid search foundation', 'Priority dashboard', 'Role-based access controls'],
  },
  {
    name: 'Scale',
    price: 'Custom',
    period: '',
    description: 'For larger teams that need strict controls and deeper integrations.',
    features: ['Custom users', 'Advanced permissions', 'Integration planning', 'Audit and retention policy', 'Dedicated onboarding'],
  },
];

export function PricingPage() {
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: string) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  return (
    <main className="page-canvas min-h-screen px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSelector value={language} onChange={changeLanguage} />
          <Link className="text-sm font-semibold text-slate-600 hover:text-ink" to="/login">
            {t('login')}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl py-12">
        <p className="status-pill inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">{t('pricing')}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-normal">{t('pricingTitle')}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{t('pricingBody')}</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-ui p-6 transition hover:-translate-y-1 ${
                plan.featured ? 'surface-panel border-teal ring-2 ring-teal/15' : 'quiet-panel'
              }`}
            >
              {plan.featured ? (
                <span className="status-pill rounded-full px-3 py-1 text-xs font-semibold">{t('recommended')}</span>
              ) : null}
              <h2 className="mt-4 text-2xl font-bold tracking-normal">{plan.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="pb-1 text-sm font-semibold text-slate-500">{plan.period}</span>
              </div>
              <ul className="mt-5 grid gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={17} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className={`mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-ui px-4 text-sm font-semibold ${
                  plan.featured ? 'primary-action text-white' : 'border border-line bg-white/80 text-slate-700 hover:border-slate-400 hover:bg-white'
                }`}
                to="/request-demo"
              >
                {plan.name === 'Scale' ? t('talkToSales') : t('requestDemo')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
