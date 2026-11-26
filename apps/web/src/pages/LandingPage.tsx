import { ArrowRight, FileSearch, LockKeyhole, Network, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KnowledgeTwinCanvas } from '../components/KnowledgeTwinCanvas';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { translate, type TranslationKey } from '../i18n';

const proofPoints: Array<{ labelKey: TranslationKey; icon: typeof ShieldCheck }> = [
  { labelKey: 'permissionAwareAnswers', icon: ShieldCheck },
  { labelKey: 'documentDecisionMemory', icon: FileSearch },
  { labelKey: 'connectedProjectContext', icon: Network },
  { labelKey: 'tenantSafe', icon: LockKeyhole },
];

export function LandingPage() {
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: TranslationKey) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  return (
    <main className="page-canvas min-h-screen text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSelector
            value={language}
            onChange={changeLanguage}
            label={t('selectLanguage')}
          />
          <Link
            to="/login"
            className="hidden h-10 items-center rounded-ui px-4 text-sm font-semibold text-slate-700 transition hover:bg-white sm:inline-flex"
          >
            {t('login')}
          </Link>
          <Link
            to="/pricing"
            className="hidden h-10 items-center rounded-ui px-4 text-sm font-semibold text-slate-700 transition hover:bg-white md:inline-flex"
          >
            {t('pricing')}
          </Link>
          <Link
            to="/request-demo"
            className="inline-flex h-10 items-center gap-2 rounded-ui bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2"
          >
            {t('requestDemo')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-14 pt-10 lg:grid-cols-[1fr_0.95fr] lg:pt-16">
        <div>
          <p className="status-pill inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
            {t('landingEyebrow')}
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-normal text-ink sm:text-6xl">
            Novera
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{t('landingBody')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/request-demo"
              className="primary-action inline-flex h-11 items-center gap-2 rounded-ui px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
            >
              {t('requestDemo')}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/pricing"
              className="secondary-action inline-flex h-11 items-center rounded-ui px-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2"
            >
              {t('viewPlans')}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <KnowledgeTwinCanvas
            domainLabels={[
              t('projects'),
              t('docs'),
              t('decisions'),
              t('currentRisks'),
              t('team'),
              t('customers'),
            ]}
            linkedDomainsLabel={t('domainsLinked')}
            liveContextLabel={t('liveContext')}
            title={t('businessTwin')}
            subtitle={t('liveKnowledgeMap')}
          />
          <div className="grid gap-4">
            <div className="surface-panel rounded-ui p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {t('managementFocus')}
              </p>
              <p className="mt-2 text-2xl font-bold text-ink">{t('prioritiesThisWeek')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t('managementFocusBody')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {proofPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.labelKey}
                    className="quiet-panel rounded-ui p-4 transition hover:-translate-y-0.5 hover:border-teal/30"
                  >
                    <Icon className="text-signal" size={20} aria-hidden="true" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">{t(item.labelKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
