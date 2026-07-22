import { ArrowRight, FileSearch, LockKeyhole, Network, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KnowledgeTwinCanvas } from '../components/KnowledgeTwinCanvas';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import { translate } from '../data/demoWorkspace';

const proofPoints = [
  { labelKey: 'permissionAwareAnswers', icon: ShieldCheck },
  { labelKey: 'documentDecisionMemory', icon: FileSearch },
  { labelKey: 'connectedProjectContext', icon: Network },
  { labelKey: 'tenantSafe', icon: LockKeyhole },
];

export function LandingPage() {
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const t = (key: string) => translate(language, key);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
  }

  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSelector value={language} onChange={changeLanguage} />
          <Link
            to="/login"
            className="hidden h-10 items-center rounded-ui px-4 text-sm font-semibold text-slate-700 transition hover:bg-white sm:inline-flex"
          >
            {t('login')}
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-10 items-center gap-2 rounded-ui bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2"
          >
            {t('signup')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-12 pt-10 lg:grid-cols-[1fr_0.95fr] lg:pt-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal">
            {t('landingEyebrow')}
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-normal text-ink sm:text-6xl">
            Novera
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t('landingBody')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex h-11 items-center gap-2 rounded-ui bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
            >
              {t('createDemoWorkspace')}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/app"
              className="inline-flex h-11 items-center rounded-ui border border-line bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2"
            >
              {t('openProductDemo')}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <KnowledgeTwinCanvas
            domainLabels={[t('projects'), t('docs'), t('decisions'), t('currentRisks'), t('team'), t('customers')]}
            linkedDomainsLabel={t('domainsLinked')}
            liveContextLabel={t('liveContext')}
            title={t('businessTwin')}
            subtitle={t('liveKnowledgeMap')}
          />
          <div className="grid gap-4">
            <div className="rounded-ui border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {t('managementFocus')}
              </p>
              <p className="mt-2 text-2xl font-bold text-ink">{t('prioritiesThisWeek')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('managementFocusBody')}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {proofPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.labelKey} className="rounded-ui border border-slate-200 bg-white p-4">
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
