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
import { clearAuth } from '../api/authApi';
import {
  createDemoDocument,
  createDemoKnowledgeItem,
  createDemoProject,
  fetchWorkspace,
  updateDemoProfile,
  ApiUser,
  WorkspaceData,
} from '../api/demoApi';
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
    setIsLoadingWorkspace(true);
    fetchWorkspace()
      .then((data) => {
        if (isMounted) {
          setWorkspace(data);
          if (data.source === 'fallback') {
            showNotice(t('usingLocalDemoData'));
          }
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
  }, []);

  const workspaceData = workspace ?? {
    organization: { name: 'Acme Studio', slug: 'acme-studio', industry: 'Digital agency' },
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
    setAssistantAnswer(t('assistantDemoAnswer'));
    setActiveView('Assistant');
  }

  function logout() {
    clearAuth();
    window.localStorage.removeItem('novera-demo-user');
    navigate('/login');
  }

  async function saveProfile(name: string, email: string) {
    if (!email.endsWith('@novera.test')) {
      const updated = { ...currentUser, name, email };
      setCurrentUser(updated);
      window.localStorage.setItem('novera-demo-user', JSON.stringify(updated));
      showNotice(t('profileUpdatedLocal'));
      return;
    }
    const saved = await updateDemoProfile(email, name);
    const updated = { ...currentUser, ...saved, focus: currentUser.focus };
    setCurrentUser(updated);
    window.localStorage.setItem('novera-demo-user', JSON.stringify(updated));
    showNotice(workspaceData.source === 'api' ? t('profileUpdatedMongo') : t('profileUpdatedLocal'));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <aside className="fixed inset-y-0 hidden w-64 border-r border-line bg-white px-4 py-5 lg:block">
        <Logo />
        <nav className="mt-8 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.view === activeView;
            return (
              <button
                key={item.view}
                className={`flex h-10 w-full items-center gap-3 rounded-ui px-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
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
        <div className="absolute bottom-5 left-4 right-4 rounded-ui border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">{t('signedInAs')}</p>
          <p className="mt-1 text-sm font-bold text-ink">{currentUser.name}</p>
          <p className="text-xs text-slate-500">{currentUser.role}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-ui border border-line bg-white text-xs font-semibold text-slate-700"
              type="button"
              onClick={() => setActiveView('Profile')}
            >
              <UserCircle size={15} aria-hidden="true" />
              {t('profile')}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-ui bg-ink text-xs font-semibold text-white"
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
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-6 py-3">
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
              className="inline-flex h-10 items-center gap-2 rounded-ui bg-ink px-4 text-sm font-semibold text-white"
              type="button"
              onClick={() => askAssistant('What should management focus on this week?')}
            >
              <Bot size={17} aria-hidden="true" />
              {t('askNovera')}
            </button>
          </div>
        </header>

        {notice ? (
          <div className="mx-6 mt-4 rounded-ui border border-teal/30 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal">
            {notice}
          </div>
        ) : null}

        <section className="p-6">
          {isLoadingWorkspace ? (
            <div className="mb-4 rounded-ui border border-line bg-white p-4 text-sm font-semibold text-slate-600">
              {t('loadingWorkspace')}
            </div>
          ) : null}
          {activeView === 'Dashboard' ? (
            <DashboardView data={workspaceData} onAsk={askAssistant} t={t} />
          ) : activeView === 'Assistant' ? (
            <AssistantView
              answer={assistantAnswer}
              onAsk={askAssistant}
              question={assistantQuestion}
              setQuestion={setAssistantQuestion}
              t={t}
            />
          ) : activeView === 'Projects' ? (
            <ProjectsView
              data={workspaceData}
              onAsk={askAssistant}
              onCreateProject={(data) => replaceWorkspace(data, t('projectCreated'))}
              t={t}
            />
          ) : activeView === 'Knowledge' ? (
            <KnowledgeView
              items={filteredKnowledge}
              onCreateKnowledge={(data) => replaceWorkspace(data, t('knowledgeItemCreated'))}
              query={query}
              setQuery={setQuery}
              t={t}
            />
          ) : activeView === 'Documents' ? (
            <DocumentsView
              data={workspaceData}
              onCreateDocument={(data) => replaceWorkspace(data, t('documentMetadataCreated'))}
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
            <SettingsView showNotice={showNotice} t={t} />
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
            <div key={label as string} className="rounded-ui border border-line bg-white p-4 shadow-sm">
              <Icon className="text-teal" size={20} aria-hidden="true" />
              <p className="mt-3 text-2xl font-bold">{value as string}</p>
              <p className="text-sm text-slate-500">{label as string}</p>
            </div>
          ))}
        </div>

        <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal">{t('managementPriorities')}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-normal">{t('thisWeek')}</h2>
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-ui bg-teal px-4 text-sm font-semibold text-white"
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
                <div key={priority} className="rounded-ui border border-slate-200 bg-slate-50 p-4">
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
  onAsk,
  question,
  setQuestion,
  t,
}: {
  answer: string;
  onAsk: (question: string) => void;
  question: string;
  setQuestion: (question: string) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold tracking-normal">{t('askBusinessMemory')}</h2>
        <textarea
          className="mt-4 min-h-32 w-full rounded-ui border border-line p-3 text-sm outline-none focus:ring-2 focus:ring-signal"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-ui bg-teal px-4 text-sm font-semibold text-white"
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
              className="rounded-ui border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-teal hover:bg-white"
              type="button"
              onClick={() => onAsk(sample)}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-teal">{t('answer')}</p>
        <p className="mt-3 text-base leading-7 text-slate-700">
          {answer || t('assistantEmpty')}
        </p>
        <div className="mt-5 grid gap-3">
          {knowledgeItems.slice(0, 3).map((source) => (
            <div key={source.title} className="rounded-ui border border-slate-200 bg-slate-50 p-4">
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

function ProjectsView({
  data,
  onAsk,
  onCreateProject,
  t,
}: {
  data: WorkspaceData;
  onAsk: (question: string) => void;
  onCreateProject: (data: WorkspaceData) => void;
  t: (key: TranslationKey) => string;
}) {
  const [name, setName] = useState('New client launch');
  const [owner, setOwner] = useState('Mira Chen');
  const [summary, setSummary] = useState('Plan and track a new customer launch workspace.');

  async function submitProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateProject(await createDemoProject({ name, owner, summary }));
  }

  return (
    <div className="space-y-5">
      <form className="rounded-ui border border-line bg-white p-5 shadow-sm" onSubmit={submitProject}>
        <h2 className="text-lg font-bold tracking-normal">{t('createProject')}</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.6fr_1.2fr_auto]">
          <input
            className="h-10 rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="h-10 rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          />
          <input
            className="h-10 rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
          <button className="h-10 rounded-ui bg-teal px-4 text-sm font-semibold text-white" type="submit">
            {t('create')}
          </button>
        </div>
      </form>
      <ProjectTable onAsk={onAsk} projects={data.projects} t={t} />
      <div className="grid gap-4 lg:grid-cols-3">
        {data.projects.map((project) => (
          <div key={project.name} className="rounded-ui border border-line bg-white p-5 shadow-sm">
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
        ))}
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
  onCreateKnowledge: (data: WorkspaceData) => void;
  query: string;
  setQuery: (query: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const [title, setTitle] = useState('New customer decision');

  async function submitKnowledge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateKnowledge(
      await createDemoKnowledgeItem({
        title,
        type: 'decision',
        summary: 'A new decision was captured from the workspace.',
      }),
    );
  }

  return (
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal">{t('knowledgeExplorer')}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal">{t('searchCompanyMemory')}</h2>
        </div>
        <label className="flex h-10 min-w-72 items-center gap-2 rounded-ui border border-line px-3">
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
          className="h-10 min-w-72 rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="h-10 rounded-ui bg-teal px-4 text-sm font-semibold text-white" type="submit">
          {t('addKnowledge')}
        </button>
      </form>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-ui border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal">
                {item.type}
              </span>
              <span className="text-xs font-medium text-slate-500">{item.project}</span>
            </div>
            <h3 className="mt-3 text-base font-bold tracking-normal">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
          </div>
        ))}
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
  onCreateDocument: (data: WorkspaceData) => void;
  showNotice: (message: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const [title, setTitle] = useState('New uploaded document');
  const [type, setType] = useState('PDF');

  async function submitDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateDocument(await createDemoDocument({ title, type }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
      <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold tracking-normal">{t('documents')}</h2>
        <div className="mt-5 overflow-hidden rounded-ui border border-slate-200">
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
      </div>
      <form className="rounded-ui border border-line bg-white p-5 shadow-sm" onSubmit={submitDocument}>
        <Upload className="text-teal" size={24} aria-hidden="true" />
        <h3 className="mt-4 text-lg font-bold tracking-normal">{t('uploadDocument')}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t('documentUploadHelp')}
        </p>
        <input
          className="mt-4 h-10 w-full rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <select
          className="mt-3 h-10 w-full rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option>PDF</option>
          <option>DOCX</option>
          <option>Markdown</option>
          <option>TXT</option>
        </select>
        <button className="mt-4 h-10 rounded-ui bg-ink px-4 text-sm font-semibold text-white" type="submit">
          {t('addDocument')}
        </button>
        <button
          className="ml-2 mt-4 h-10 rounded-ui border border-line px-4 text-sm font-semibold text-slate-700"
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
        <div key={integration} className="rounded-ui border border-line bg-white p-5 shadow-sm">
          <Plug className="text-signal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{integration}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t('integrationPrepared')}
          </p>
          <button
            className="mt-4 h-9 rounded-ui border border-line px-3 text-sm font-semibold text-slate-700"
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
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold tracking-normal">{t('teamPermissions')}</h2>
      <div className="mt-5 grid gap-3">
        {data.users.map((user) => (
          <div
            key={user.email}
            className="flex flex-wrap items-center justify-between gap-3 rounded-ui border border-slate-200 bg-slate-50 p-4"
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
        ))}
      </div>
    </div>
  );
}

function ActivityView({ data, t }: { data: WorkspaceData; t: (key: TranslationKey) => string }) {
  return (
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold tracking-normal">{t('activityTimeline')}</h2>
      <div className="mt-5 grid gap-3">
        {data.activities.map((item) => (
          <div key={`${item.actor}-${item.target}`} className="rounded-ui border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              {item.actor} {item.action}
            </p>
            <p className="mt-1 text-sm text-slate-600">{item.target}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">{item.time}</p>
          </div>
        ))}
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
  onSave: (name: string, email: string) => void;
  t: (key: TranslationKey) => string;
}) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
        <UserCircle className="text-teal" size={42} aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold tracking-normal">{currentUser.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{currentUser.email}</p>
        <p className="mt-4 rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">{currentUser.role}</p>
        <p className="mt-4 text-sm leading-6 text-slate-600">{currentUser.focus}</p>
      </div>
      <form
        className="rounded-ui border border-line bg-white p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(name, email);
        }}
      >
        <h2 className="text-2xl font-bold tracking-normal">{t('profile')}</h2>
        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">{t('name')}</span>
          <input
            className="mt-2 h-11 w-full rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
          <input
            className="mt-2 h-11 w-full rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button className="mt-5 h-10 rounded-ui bg-teal px-4 text-sm font-semibold text-white" type="submit">
          {t('saveChanges')}
        </button>
      </form>
    </div>
  );
}

function SettingsView({
  showNotice,
  t,
}: {
  showNotice: (message: string) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {[
        [t('organization'), t('organizationSettingsBody')],
        [t('security'), t('securitySettingsBody')],
        [t('aiProvider'), t('aiProviderSettingsBody')],
      ].map(([title, body]) => (
        <div key={title} className="rounded-ui border border-line bg-white p-5 shadow-sm">
          <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          <button
            className="mt-4 h-9 rounded-ui border border-line px-3 text-sm font-semibold text-slate-700"
            type="button"
            onClick={() => showNotice(`${title} ${t('settingsSavedLocal')}`)}
          >
            {t('saveChanges')}
          </button>
        </div>
      ))}
    </div>
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
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold tracking-normal">{t('activeProjects')}</h2>
      <div className="mt-4 overflow-hidden rounded-ui border border-slate-200">
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
    </div>
  );
}

function RiskPanel({ risks, t }: { risks: WorkspaceData['risks']; t: (key: TranslationKey) => string }) {
  return (
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold tracking-normal">{t('currentRisks')}</h2>
      <div className="mt-4 grid gap-3">
        {risks.map((risk) => (
          <div key={risk.title} className="rounded-ui border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">{risk.title}</p>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {risk.severity}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
