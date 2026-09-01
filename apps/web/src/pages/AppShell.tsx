import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  FolderKanban,
  Home,
  LockKeyhole,
  LogOut,
  Plug,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCircle,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth, updateCurrentUser } from '../api/authApi';
import {
  createDemoKnowledgeItem,
  createDemoProject,
  fetchWorkspace,
  ApiUser,
  WorkspaceData,
} from '../api/demoApi';
import {
  createProductionKnowledgeItem,
  createProductionDocument,
  createProductionProject,
  fetchProductionWorkspace,
  hasProductionSession,
  updateProductionOrganization,
} from '../api/productionApi';
import { KnowledgeTwinCanvas } from '../components/KnowledgeTwinCanvas';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import {
  activities,
  assistantQuestions,
  demoUsers,
  documents,
  getDemoUserByEmail,
  knowledgeItems,
  projects,
  risks,
  translate,
  TranslationKey,
} from '../data/demoWorkspace';

const navItems: Array<{ key: TranslationKey; view: string; icon: typeof Home }> = [
  { key: 'dashboard', view: 'Dashboard', icon: Home },
  { key: 'assistant', view: 'Assistant', icon: Bot },
  { key: 'projects', view: 'Projects', icon: FolderKanban },
  { key: 'knowledge', view: 'Knowledge', icon: Search },
  { key: 'documents', view: 'Documents', icon: FileText },
  { key: 'integrations', view: 'Integrations', icon: Plug },
  { key: 'team', view: 'Team', icon: Users },
  { key: 'activity', view: 'Activity', icon: Activity },
  { key: 'settings', view: 'Settings', icon: Settings },
];

function getStoredUser() {
  try {
    const stored = window.localStorage.getItem('novera-demo-user');
    if (!stored) {
      return demoUsers[0];
    }
    const parsed = JSON.parse(stored);
    const demoUser = getDemoUserByEmail(parsed.email);
    return demoUser.email === parsed.email
      ? demoUser
      : { ...parsed, focus: parsed.focus ?? 'Workspace profile and organization access.' };
  } catch {
    return demoUsers[0];
  }
}

export function AppShell() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('Dashboard');
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const [query, setQuery] = useState('');
  const [assistantQuestion, setAssistantQuestion] = useState(assistantQuestions[0]);
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [notice, setNotice] = useState('');
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);

  const t = (key: TranslationKey) => translate(language, key);

  useEffect(() => {
    let isMounted = true;
    if (!hasProductionSession()) {
      window.localStorage.removeItem('novera-demo-user');
      navigate('/login');
      return () => {
        isMounted = false;
      };
    }
    setIsLoadingWorkspace(true);
    const workspaceRequest = hasProductionSession() ? fetchProductionWorkspace() : fetchWorkspace();
    workspaceRequest
      .then((data) => {
        if (isMounted) {
          setWorkspace(data);
          if (data.source === 'fallback') {
            showNotice(t('usingLocalDemoData'));
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          showNotice(t('workspaceLoadFailed'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingWorkspace(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const workspaceData = workspace ?? {
    organization: { id: undefined, name: 'Acme Studio', slug: 'acme-studio', industry: 'Digital agency' },
    users: demoUsers,
    projects,
    knowledgeItems,
    documents,
    risks,
    activities,
    source: 'fallback' as const,
  };

  const filteredKnowledge = useMemo(() => {
    const normalized = query.toLowerCase();
    return workspaceData.knowledgeItems.filter((item) =>
      [item.title, item.summary, item.type, item.project].join(' ').toLowerCase().includes(normalized),
    );
  }, [query, workspaceData.knowledgeItems]);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
    showNotice(`${t('languageChanged')}: ${value.toUpperCase()}`);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function replaceWorkspace(data: WorkspaceData, message: string) {
    setWorkspace(data);
    showNotice(data.source === 'api' ? message : `${message} locally`);
  }

  function askAssistant(question: string) {
    setAssistantQuestion(question);
    setAssistantAnswer(generateWorkspaceAnswer(question, workspaceData, t));
    setActiveView('Assistant');
  }

  function logout() {
    clearAuth();
    window.localStorage.removeItem('novera-demo-user');
    navigate('/login');
  }

  async function saveProfile(name: string) {
    try {
      const saved = await updateCurrentUser({ name });
      const updated = { ...currentUser, ...saved, focus: currentUser.focus };
      setCurrentUser(updated);
      window.localStorage.setItem('novera-demo-user', JSON.stringify(updated));
      showNotice(t('profileUpdatedMongo'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function createProject(input: { name: string; owner: string; summary: string }) {
    try {
      const data = hasProductionSession()
        ? await createProductionProject(input)
        : await createDemoProject(input);
      replaceWorkspace(data, t('projectCreated'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function createKnowledge(input: { title: string; type: string; summary: string }) {
    try {
      const data = hasProductionSession()
        ? await createProductionKnowledgeItem(input)
        : await createDemoKnowledgeItem(input);
      replaceWorkspace(data, t('knowledgeItemCreated'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function createDocument(input: { title: string; type: string }) {
    try {
      const data = await createProductionDocument(input);
      replaceWorkspace(data, t('documentMetadataCreated'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function saveOrganizationSettings(input: { name: string; industry: string; aiProvider: string }) {
    if (!workspaceData.organization.id) {
      showNotice(t('saveFailed'));
      return;
    }
    try {
      const data = await updateProductionOrganization({
        organizationId: workspaceData.organization.id,
        ...input,
      });
      replaceWorkspace(data, t('settingsSaved'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F6F8] text-ink">
      <aside className="fixed inset-y-0 hidden w-64 border-r border-slate-800/70 bg-navy px-4 py-5 text-white shadow-2xl lg:block">
        <div className="[&_*]:text-white">
          <Logo />
        </div>
        <nav className="mt-8 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.view === activeView;
            return (
              <button
                key={item.view}
                className={`flex h-10 w-full items-center gap-3 rounded-ui px-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                type="button"
                onClick={() => setActiveView(item.view)}
              >
                <Icon size={18} aria-hidden="true" />
                {t(item.key)}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-ui border border-white/10 bg-white/8 p-3 backdrop-blur">
          <p className="text-xs font-semibold uppercase text-slate-400">{t('signedInAs')}</p>
          <p className="mt-1 text-sm font-bold text-white">{currentUser.name}</p>
          <p className="text-xs text-slate-300">{currentUser.role}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-ui border border-white/15 bg-white/10 text-xs font-semibold text-white"
              type="button"
              onClick={() => setActiveView('Profile')}
            >
              <UserCircle size={15} aria-hidden="true" />
              {t('profile')}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-ui bg-white text-xs font-semibold text-navy"
              type="button"
              onClick={logout}
            >
              <LogOut size={15} aria-hidden="true" />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-line bg-white/88 px-6 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-sm text-slate-500">{workspaceData.organization.name}</p>
            <h1 className="text-xl font-bold tracking-normal">
              {activeView === 'Profile'
                ? t('profile')
                : t(navItems.find((item) => item.view === activeView)?.key ?? 'dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector value={language} onChange={changeLanguage} />
            <button
              className="primary-action inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
              type="button"
              onClick={() => askAssistant('What should management focus on this week?')}
            >
              <Bot size={17} aria-hidden="true" />
              {t('askNovera')}
            </button>
          </div>
        </header>

        {notice ? (
          <div className="mx-6 mt-4 rounded-ui border border-teal/30 bg-white px-4 py-3 text-sm font-semibold text-teal shadow-sm">
            {notice}
          </div>
        ) : null}

        <section className="p-6">
          {isLoadingWorkspace ? (
            <div className="surface-panel mb-4 rounded-ui p-4 text-sm font-semibold text-slate-600">
              {t('loadingWorkspace')}
            </div>
          ) : null}
          {activeView === 'Dashboard' ? (
            <DashboardView data={workspaceData} onAsk={askAssistant} t={t} />
          ) : activeView === 'Assistant' ? (
            <AssistantView
              answer={assistantAnswer}
              data={workspaceData}
              onAsk={askAssistant}
              question={assistantQuestion}
              setQuestion={setAssistantQuestion}
              t={t}
            />
          ) : activeView === 'Projects' ? (
            <ProjectsView
              data={workspaceData}
              onAsk={askAssistant}
              onCreateProject={createProject}
              t={t}
            />
          ) : activeView === 'Knowledge' ? (
            <KnowledgeView
              items={filteredKnowledge}
              onCreateKnowledge={createKnowledge}
              query={query}
              setQuery={setQuery}
              t={t}
            />
          ) : activeView === 'Documents' ? (
            <DocumentsView
              data={workspaceData}
              onCreateDocument={createDocument}
              showNotice={showNotice}
              t={t}
            />
          ) : activeView === 'Integrations' ? (
            <IntegrationsView showNotice={showNotice} t={t} />
          ) : activeView === 'Team' ? (
            <TeamView data={workspaceData} t={t} />
          ) : activeView === 'Activity' ? (
            <ActivityView data={workspaceData} t={t} />
          ) : activeView === 'Profile' ? (
            <ProfileView currentUser={currentUser} onSave={saveProfile} t={t} />
          ) : (
            <SettingsView data={workspaceData} onSave={saveOrganizationSettings} t={t} />
          )}
        </section>
      </main>
    </div>
  );
}

function DashboardView({
  data,
  onAsk,
  t,
}: {
  data: WorkspaceData;
  onAsk: (question: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const hasWorkspaceSignal = data.projects.length + data.knowledgeItems.length + data.documents.length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [t('activeProjects'), String(data.projects.length), FolderKanban],
            [t('openRisks'), String(data.risks.length), AlertTriangle],
            [t('recentDecisions'), String(data.knowledgeItems.filter((item) => item.type === 'Decision').length), CheckCircle2],
            [t('documents'), String(data.documents.length), FileText],
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="surface-panel rounded-ui p-4 transition hover:-translate-y-0.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-ui bg-teal/10">
                <Icon className="text-teal" size={20} aria-hidden="true" />
              </span>
              <p className="mt-3 text-2xl font-bold">{value as string}</p>
              <p className="text-sm text-slate-500">{label as string}</p>
            </div>
          ))}
        </div>

        {!hasWorkspaceSignal ? (
          <div className="surface-panel overflow-hidden rounded-ui p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-sm font-semibold text-teal">{t('emptyWorkspaceEyebrow')}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal">{t('emptyWorkspaceTitle')}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t('emptyWorkspaceBody')}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="primary-action inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
                    type="button"
                    onClick={() => onAsk('What information should we add first to build this company twin?')}
                  >
                    <Sparkles size={16} aria-hidden="true" />
                    {t('planFirstWorkspace')}
                  </button>
                  <button
                    className="secondary-action inline-flex h-10 items-center rounded-ui px-4 text-sm font-semibold"
                    type="button"
                    onClick={() => onAsk('What should management focus on this week with no workspace data yet?')}
                  >
                    {t('askReadinessQuestion')}
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                {['emptyStepProject', 'emptyStepKnowledge', 'emptyStepDocument'].map((step, index) => (
                  <div key={step} className="quiet-panel flex gap-3 rounded-ui p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-ui bg-teal/10 text-sm font-bold text-teal">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold leading-6 text-slate-700">{t(step)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="surface-panel rounded-ui p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal">{t('managementPriorities')}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-normal">{t('thisWeek')}</h2>
            </div>
            <button
              className="primary-action inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
              type="button"
              onClick={() => onAsk('What should management focus on this week?')}
            >
              <Sparkles size={16} aria-hidden="true" />
              {t('explainPriorities')}
            </button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {['priorityAtlasCredentials', 'priorityRetainerScope', 'priorityFinancePermissions'].map(
              (priority) => (
                <div key={priority} className="quiet-panel rounded-ui p-4">
                  <p className="text-sm font-semibold text-slate-800">{t(priority)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t('linkedToActivity')}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <ProjectTable onAsk={onAsk} projects={data.projects} t={t} />
      </div>

      <div className="space-y-5">
        <KnowledgeTwinCanvas
          domainLabels={[t('projects'), t('docs'), t('decisions'), t('currentRisks'), t('team'), t('customers')]}
          linkedDomainsLabel={t('domainsLinked')}
          liveContextLabel={t('liveContext')}
          title={t('businessTwin')}
          subtitle={t('liveKnowledgeMap')}
        />
        <RiskPanel risks={data.risks} t={t} />
      </div>
    </div>
  );
}

function AssistantView({
  answer,
  data,
  onAsk,
  question,
  setQuestion,
  t,
}: {
  answer: string;
  data: WorkspaceData;
  onAsk: (question: string) => void;
  question: string;
  setQuestion: (question: string) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="surface-panel rounded-ui p-5">
        <h2 className="text-lg font-bold tracking-normal">{t('askBusinessMemory')}</h2>
        <textarea
          className="mt-4 min-h-32 w-full field-frame rounded-ui p-3 text-sm outline-none"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          className="primary-action mt-3 inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
          type="button"
          onClick={() => onAsk(question)}
        >
          <Bot size={17} aria-hidden="true" />
          {t('generateAnswer')}
        </button>
        <div className="mt-5 grid gap-2">
          {assistantQuestions.map((sample) => (
            <button
              key={sample}
              className="quiet-panel rounded-ui px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-teal/40 hover:bg-white"
              type="button"
              onClick={() => onAsk(sample)}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-panel rounded-ui p-5">
        <p className="text-sm font-semibold text-teal">{t('answer')}</p>
        <p className="mt-3 text-base leading-7 text-slate-700">
          {answer || t('assistantEmpty')}
        </p>
        <div className="mt-5 grid gap-3">
          {data.knowledgeItems.slice(0, 3).map((source) => (
            <div key={source.title} className="quiet-panel rounded-ui p-4">
              <p className="text-sm font-bold text-slate-800">{source.title}</p>
              <p className="mt-1 text-sm text-slate-600">{source.source}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-ui bg-blue-50 p-3 text-sm font-medium text-blue-800">
          {t('assistantConfidence')}
        </p>
      </div>
    </div>
  );
}

function generateWorkspaceAnswer(
  question: string,
  data: WorkspaceData,
  t: (key: TranslationKey) => string,
) {
  const normalized = question.toLowerCase();
  const delayedProject = data.projects.find((project) =>
    [project.name, project.status, project.summary].join(' ').toLowerCase().includes('delayed'),
  );
  const matchedProject = data.projects.find((project) =>
    normalized.includes(project.name.toLowerCase()),
  ) ?? delayedProject;
  const relatedKnowledge = data.knowledgeItems.filter((item) =>
    matchedProject ? item.project === matchedProject.name : normalized.includes(item.type.toLowerCase()),
  );
  const recentActivity = data.activities.slice(0, 3);

  if (!data.projects.length && !data.knowledgeItems.length && !data.documents.length) {
    return t('assistantNoInformation');
  }

  if (normalized.includes('delayed') || normalized.includes('delay') || normalized.includes('why')) {
    if (!matchedProject) {
      return t('assistantNoInformation');
    }
    return [
      `${matchedProject.name}: ${matchedProject.summary || t('assistantLimitedProjectContext')}`,
      `${t('status')}: ${matchedProject.status}. ${t('risk')}: ${matchedProject.risk}. ${t('owner')}: ${matchedProject.owner}.`,
      relatedKnowledge.length
        ? `${t('supportingSources')}: ${relatedKnowledge.map((item) => item.title).join(', ')}.`
        : t('assistantLimitedSources'),
    ].join(' ');
  }

  if (normalized.includes('decision')) {
    const decisions = data.knowledgeItems.filter((item) => item.type.toLowerCase().includes('decision'));
    if (!decisions.length) {
      return t('assistantNoInformation');
    }
    return `${t('recentDecisions')}: ${decisions.map((item) => `${item.title} (${item.project})`).join('; ')}. ${t('assistantGroundingNote')}`;
  }

  if (normalized.includes('risk') || normalized.includes('focus') || normalized.includes('week')) {
    const riskSummary = data.risks.length
      ? data.risks.map((risk) => `${risk.title}: ${risk.mitigation}`).join('; ')
      : t('assistantNoRisksRecorded');
    const projectSummary = data.projects.slice(0, 3).map((project) => `${project.name} (${project.status})`).join(', ');
    return `${t('managementFocus')}: ${projectSummary || t('assistantNoProjectsRecorded')}. ${riskSummary}. ${t('assistantGroundingNote')}`;
  }

  if (recentActivity.length) {
    return `${t('activityTimeline')}: ${recentActivity.map((event) => `${event.actor} ${event.action} ${event.target}`).join('; ')}. ${t('assistantGroundingNote')}`;
  }

  return t('assistantNoInformation');
}

function ProjectsView({
  data,
  onAsk,
  onCreateProject,
  t,
}: {
  data: WorkspaceData;
  onAsk: (question: string) => void;
  onCreateProject: (input: { name: string; owner: string; summary: string }) => Promise<void>;
  t: (key: TranslationKey) => string;
}) {
  const [name, setName] = useState('New client launch');
  const [owner, setOwner] = useState('Mira Chen');
  const [summary, setSummary] = useState('Plan and track a new customer launch workspace.');

  async function submitProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateProject({ name, owner, summary });
  }

  return (
    <div className="space-y-5">
      <form className="surface-panel rounded-ui p-5" onSubmit={submitProject}>
        <h2 className="text-lg font-bold tracking-normal">{t('createProject')}</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.6fr_1.2fr_auto]">
          <input
            className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          />
          <input
            className="field-frame h-10 rounded-ui px-3 text-sm outline-none"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
          <button className="primary-action h-10 rounded-ui px-4 text-sm font-semibold text-white" type="submit">
            {t('create')}
          </button>
        </div>
      </form>
      <ProjectTable onAsk={onAsk} projects={data.projects} t={t} />
      <div className="grid gap-4 lg:grid-cols-3">
        {data.projects.length ? data.projects.map((project) => (
          <div key={project.name} className="surface-panel rounded-ui p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-normal">{project.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('owner')}: {project.owner}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {project.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{project.summary}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-teal" style={{ width: `${project.progress}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {project.progress}% {t('complete')}
            </p>
          </div>
        )) : (
          <EmptyState title={t('noProjectsTitle')} body={t('noProjectsBody')} />
        )}
      </div>
    </div>
  );
}

function KnowledgeView({
  items,
  onCreateKnowledge,
  query,
  setQuery,
  t,
}: {
  items: typeof knowledgeItems;
  onCreateKnowledge: (input: { title: string; type: string; summary: string }) => Promise<void>;
  query: string;
  setQuery: (query: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const [title, setTitle] = useState('New customer decision');

  async function submitKnowledge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateKnowledge(
      {
        title,
        type: 'decision',
        summary: 'A new decision was captured from the workspace.',
      },
    );
  }

  return (
    <div className="surface-panel rounded-ui p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal">{t('knowledgeExplorer')}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal">{t('searchCompanyMemory')}</h2>
        </div>
        <label className="field-frame flex h-10 min-w-72 items-center gap-2 rounded-ui px-3">
          <Search size={17} className="text-slate-400" aria-hidden="true" />
          <input
            className="w-full border-0 bg-transparent text-sm outline-none"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <form className="mt-5 flex flex-wrap gap-3" onSubmit={submitKnowledge}>
        <input
          className="h-10 min-w-72 field-frame rounded-ui px-3 text-sm outline-none"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="h-10 primary-action rounded-ui px-4 text-sm font-semibold text-white" type="submit">
          {t('addKnowledge')}
        </button>
      </form>
      <div className="mt-5 grid gap-3">
        {items.length ? items.map((item) => (
          <div key={item.title} className="quiet-panel rounded-ui p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal">
                {item.type}
              </span>
              <span className="text-xs font-medium text-slate-500">{item.project}</span>
            </div>
            <h3 className="mt-3 text-base font-bold tracking-normal">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
          </div>
        )) : (
          <EmptyState title={t('noKnowledgeTitle')} body={t('noKnowledgeBody')} />
        )}
      </div>
    </div>
  );
}

function DocumentsView({
  data,
  onCreateDocument,
  showNotice,
  t,
}: {
  data: WorkspaceData;
  onCreateDocument: (input: { title: string; type: string }) => Promise<void>;
  showNotice: (message: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const [title, setTitle] = useState('New uploaded document');
  const [type, setType] = useState('PDF');

  async function submitDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateDocument({ title, type });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
      <div className="surface-panel rounded-ui p-5">
        <h2 className="text-2xl font-bold tracking-normal">{t('documents')}</h2>
        <div className="table-surface mt-5 overflow-hidden rounded-ui">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('document')}</th>
                <th className="px-4 py-3 font-semibold">{t('project')}</th>
                <th className="px-4 py-3 font-semibold">{t('type')}</th>
                <th className="px-4 py-3 font-semibold">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.documents.map((document) => (
                <tr key={document.title}>
                  <td className="px-4 py-3 font-medium text-slate-800">{document.title}</td>
                  <td className="px-4 py-3 text-slate-600">{document.project}</td>
                  <td className="px-4 py-3 text-slate-600">{document.type}</td>
                  <td className="px-4 py-3 text-slate-600">{document.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.documents.length ? (
          <div className="mt-4">
            <EmptyState title={t('noDocumentsTitle')} body={t('noDocumentsBody')} />
          </div>
        ) : null}
      </div>
      <form className="surface-panel rounded-ui p-5" onSubmit={submitDocument}>
        <Upload className="text-teal" size={24} aria-hidden="true" />
        <h3 className="mt-4 text-lg font-bold tracking-normal">{t('uploadDocument')}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t('documentUploadHelp')}
        </p>
        <input
          className="mt-4 h-10 w-full field-frame rounded-ui px-3 text-sm outline-none"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <select
          className="mt-3 h-10 w-full field-frame rounded-ui px-3 text-sm outline-none"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option>PDF</option>
          <option>DOCX</option>
          <option>Markdown</option>
          <option>TXT</option>
        </select>
        <button className="mt-4 h-10 primary-action rounded-ui px-4 text-sm font-semibold text-white" type="submit">
          {t('addDocument')}
        </button>
        <button
          className="secondary-action ml-2 mt-4 h-10 rounded-ui px-4 text-sm font-semibold"
          type="button"
          onClick={() => showNotice(t('fileUploadLater'))}
        >
          {t('selectFile')}
        </button>
      </form>
    </div>
  );
}

function IntegrationsView({
  showNotice,
  t,
}: {
  showNotice: (message: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const integrations = ['Gmail', 'Google Drive', 'Slack', 'GitHub', 'Notion', 'Jira', 'Microsoft Teams', 'Trello'];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {integrations.map((integration) => (
        <div key={integration} className="surface-panel rounded-ui p-5">
          <Plug className="text-signal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{integration}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t('integrationPrepared')}
          </p>
          <button
            className="secondary-action mt-4 h-9 rounded-ui px-3 text-sm font-semibold"
            type="button"
            onClick={() => showNotice(`${integration} ${t('integrationLater')}`)}
          >
            {t('connect')}
          </button>
        </div>
      ))}
    </div>
  );
}

function TeamView({ data, t }: { data: WorkspaceData; t: (key: TranslationKey) => string }) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <h2 className="text-2xl font-bold tracking-normal">{t('teamPermissions')}</h2>
      <div className="mt-5 grid gap-3">
        {data.users.length ? data.users.map((user) => (
          <div
            key={user.email}
            className="flex flex-wrap items-center justify-between gap-3 quiet-panel rounded-ui p-4"
          >
            <div>
              <p className="font-bold text-slate-800">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal">{user.role}</span>
              <LockKeyhole size={18} className="text-slate-400" aria-hidden="true" />
            </div>
          </div>
        )) : (
          <EmptyState title={t('noTeamTitle')} body={t('noTeamBody')} />
        )}
      </div>
    </div>
  );
}

function ActivityView({ data, t }: { data: WorkspaceData; t: (key: TranslationKey) => string }) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <h2 className="text-2xl font-bold tracking-normal">{t('activityTimeline')}</h2>
      <div className="mt-5 grid gap-3">
        {data.activities.length ? data.activities.map((item) => (
          <div key={`${item.actor}-${item.target}`} className="quiet-panel rounded-ui p-4">
            <p className="text-sm font-semibold text-slate-800">
              {item.actor} {item.action}
            </p>
            <p className="mt-1 text-sm text-slate-600">{item.target}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">{item.time}</p>
          </div>
        )) : (
          <EmptyState title={t('noActivityTitle')} body={t('noActivityBody')} />
        )}
      </div>
    </div>
  );
}

function ProfileView({
  currentUser,
  onSave,
  t,
}: {
  currentUser: ApiUser;
  onSave: (name: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const [name, setName] = useState(currentUser.name);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="surface-panel rounded-ui p-5">
        <UserCircle className="text-teal" size={42} aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold tracking-normal">{currentUser.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{currentUser.email}</p>
        <p className="mt-4 rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">{currentUser.role}</p>
        <p className="mt-4 text-sm leading-6 text-slate-600">{currentUser.focus}</p>
      </div>
      <form
        className="surface-panel rounded-ui p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(name);
        }}
      >
        <h2 className="text-2xl font-bold tracking-normal">{t('profile')}</h2>
        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">{t('name')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            type="email"
            value={currentUser.email}
            readOnly
          />
          <span className="mt-2 block text-xs font-medium text-slate-500">{t('emailChangeLater')}</span>
        </label>
        <button className="mt-5 h-10 primary-action rounded-ui px-4 text-sm font-semibold text-white" type="submit">
          {t('saveChanges')}
        </button>
      </form>
    </div>
  );
}

function SettingsView({
  data,
  onSave,
  t,
}: {
  data: WorkspaceData;
  onSave: (input: { name: string; industry: string; aiProvider: string }) => Promise<void>;
  t: (key: TranslationKey) => string;
}) {
  const [name, setName] = useState(data.organization.name);
  const [industry, setIndustry] = useState(data.organization.industry ?? 'Knowledge business');
  const [aiProvider, setAiProvider] = useState('mock');

  return (
    <form
      className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ name, industry, aiProvider });
      }}
    >
      <div className="surface-panel rounded-ui p-5">
        <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold tracking-normal">{t('organization')}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t('organizationSettingsBody')}</p>
        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">{t('organization')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">{t('industry')}</span>
          <input
            className="mt-2 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
          />
        </label>
        <button className="mt-5 h-10 primary-action rounded-ui px-4 text-sm font-semibold text-white" type="submit">
          {t('saveChanges')}
        </button>
      </div>
      <div className="grid gap-5">
        <div className="surface-panel rounded-ui p-5">
          <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{t('aiProvider')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('aiProviderSettingsBody')}</p>
          <select
            className="mt-4 h-11 w-full field-frame rounded-ui px-3 text-sm outline-none"
            value={aiProvider}
            onChange={(event) => setAiProvider(event.target.value)}
          >
            <option value="mock">Mock local assistant</option>
            <option value="openai">OpenAI ready</option>
            <option value="custom">Custom provider</option>
          </select>
        </div>
        <div className="surface-panel rounded-ui p-5">
          <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{t('security')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('securitySettingsBody')}</p>
        </div>
      </div>
    </form>
  );
}

function ProjectTable({
  onAsk,
  projects,
  t,
}: {
  onAsk: (question: string) => void;
  projects: WorkspaceData['projects'];
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <h2 className="text-lg font-bold tracking-normal">{t('activeProjects')}</h2>
      <div className="table-surface mt-4 overflow-hidden rounded-ui">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('project')}</th>
              <th className="px-4 py-3 font-semibold">{t('status')}</th>
              <th className="px-4 py-3 font-semibold">{t('risk')}</th>
              <th className="px-4 py-3 font-semibold">{t('owner')}</th>
              <th className="px-4 py-3 font-semibold">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.map((project) => (
              <tr key={project.name}>
                <td className="px-4 py-3 font-medium text-slate-800">{project.name}</td>
                <td className="px-4 py-3 text-slate-600">{project.status}</td>
                <td className="px-4 py-3 text-slate-600">{project.risk}</td>
                <td className="px-4 py-3 text-slate-600">{project.owner}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-sm font-semibold text-teal hover:text-teal-700"
                    type="button"
                    onClick={() => onAsk(`Why is ${project.name} ${project.status.toLowerCase()}?`)}
                  >
                    {t('askWhy')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!projects.length ? (
        <div className="mt-4">
          <EmptyState title={t('noProjectsTitle')} body={t('noProjectsBody')} />
        </div>
      ) : null}
    </div>
  );
}

function RiskPanel({ risks, t }: { risks: WorkspaceData['risks']; t: (key: TranslationKey) => string }) {
  return (
    <div className="surface-panel rounded-ui p-5">
      <h2 className="text-lg font-bold tracking-normal">{t('currentRisks')}</h2>
      <div className="mt-4 grid gap-3">
        {risks.length ? risks.map((risk) => (
          <div key={risk.title} className="quiet-panel rounded-ui p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">{risk.title}</p>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {risk.severity}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
          </div>
        )) : (
          <EmptyState title={t('noRisksTitle')} body={t('noRisksBody')} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="quiet-panel rounded-ui p-5">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-ui bg-slate-100">
          <Sparkles className="text-teal" size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
        </div>
      </div>
    </div>
  );
}
