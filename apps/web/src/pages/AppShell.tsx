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
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    return stored ? getDemoUserByEmail(JSON.parse(stored).email) : demoUsers[0];
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

  const t = (key: TranslationKey) => translate(language, key);

  const filteredKnowledge = useMemo(() => {
    const normalized = query.toLowerCase();
    return knowledgeItems.filter((item) =>
      [item.title, item.summary, item.type, item.project].join(' ').toLowerCase().includes(normalized),
    );
  }, [query]);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
    showNotice(`Language changed to ${value.toUpperCase()}`);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function askAssistant(question: string) {
    setAssistantQuestion(question);
    setAssistantAnswer(
      'Atlas onboarding is delayed because CRM export credentials are missing. The management decision delayed launch by one week, and the current mitigation is to escalate to the customer sponsor while preparing a fallback CSV import path.',
    );
    setActiveView('Assistant');
  }

  function logout() {
    window.localStorage.removeItem('novera-demo-user');
    navigate('/login');
  }

  function saveProfile(name: string, email: string) {
    const updated = { ...currentUser, name, email };
    setCurrentUser(updated);
    window.localStorage.setItem('novera-demo-user', JSON.stringify(updated));
    showNotice('Profile updated');
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
          <p className="text-xs font-semibold uppercase text-slate-500">Signed in as</p>
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
            <p className="text-sm text-slate-500">Acme Studio</p>
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
          {activeView === 'Dashboard' ? (
            <DashboardView onAsk={askAssistant} t={t} />
          ) : activeView === 'Assistant' ? (
            <AssistantView
              answer={assistantAnswer}
              onAsk={askAssistant}
              question={assistantQuestion}
              setQuestion={setAssistantQuestion}
            />
          ) : activeView === 'Projects' ? (
            <ProjectsView onAsk={askAssistant} />
          ) : activeView === 'Knowledge' ? (
            <KnowledgeView items={filteredKnowledge} query={query} setQuery={setQuery} t={t} />
          ) : activeView === 'Documents' ? (
            <DocumentsView showNotice={showNotice} t={t} />
          ) : activeView === 'Integrations' ? (
            <IntegrationsView showNotice={showNotice} t={t} />
          ) : activeView === 'Team' ? (
            <TeamView t={t} />
          ) : activeView === 'Activity' ? (
            <ActivityView t={t} />
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

function DashboardView({ onAsk, t }: { onAsk: (question: string) => void; t: (key: TranslationKey) => string }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [t('activeProjects'), '3', FolderKanban],
            [t('openRisks'), '2', AlertTriangle],
            [t('recentDecisions'), '4', CheckCircle2],
            [t('documents'), '3', FileText],
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
            {['Escalate Atlas credentials', 'Approve Q3 retainer scope', 'Confirm finance portal permissions'].map(
              (priority) => (
                <div key={priority} className="rounded-ui border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">{priority}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Linked to project status, recent decisions, and risk activity.
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <ProjectTable onAsk={onAsk} t={t} />
      </div>

      <div className="space-y-5">
        <KnowledgeTwinCanvas title={t('businessTwin')} subtitle={t('liveKnowledgeMap')} />
        <RiskPanel t={t} />
      </div>
    </div>
  );
}

function AssistantView({
  answer,
  onAsk,
  question,
  setQuestion,
}: {
  answer: string;
  onAsk: (question: string) => void;
  question: string;
  setQuestion: (question: string) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold tracking-normal">Ask the business memory</h2>
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
          Generate answer
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
        <p className="text-sm font-semibold text-teal">Answer</p>
        <p className="mt-3 text-base leading-7 text-slate-700">
          {answer ||
            'Ask a question to receive a grounded answer from the demo workspace. Novera will show sources and limitations instead of inventing information.'}
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
          Confidence: medium-high. Limitation: this is demo data until real ingestion and retrieval
          are connected.
        </p>
      </div>
    </div>
  );
}

function ProjectsView({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="space-y-5">
      <ProjectTable onAsk={onAsk} t={(key) => translate('en', key)} />
      <div className="grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.name} className="rounded-ui border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-normal">{project.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Owner: {project.owner}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {project.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{project.summary}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-teal" style={{ width: `${project.progress}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">{project.progress}% complete</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeView({
  items,
  query,
  setQuery,
  t,
}: {
  items: typeof knowledgeItems;
  query: string;
  setQuery: (query: string) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal">Knowledge explorer</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal">{t('searchCompanyMemory')}</h2>
        </div>
        <label className="flex h-10 min-w-72 items-center gap-2 rounded-ui border border-line px-3">
          <Search size={17} className="text-slate-400" aria-hidden="true" />
          <input
            className="w-full border-0 bg-transparent text-sm outline-none"
            placeholder="Search decisions, meetings, risks..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
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
  showNotice,
  t,
}: {
  showNotice: (message: string) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
      <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold tracking-normal">{t('documents')}</h2>
        <div className="mt-5 overflow-hidden rounded-ui border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Document</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {documents.map((document) => (
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
      <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
        <Upload className="text-teal" size={24} aria-hidden="true" />
        <h3 className="mt-4 text-lg font-bold tracking-normal">{t('uploadDocument')}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          PDF, DOCX, TXT, and Markdown uploads will connect to real storage in the documents milestone.
        </p>
        <button
          className="mt-4 h-10 rounded-ui bg-ink px-4 text-sm font-semibold text-white"
          type="button"
          onClick={() => showNotice('Document upload workflow queued for backend connection')}
        >
          Select file
        </button>
      </div>
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
            Connection prepared for the integration architecture.
          </p>
          <button
            className="mt-4 h-9 rounded-ui border border-line px-3 text-sm font-semibold text-slate-700"
            type="button"
            onClick={() => showNotice(`${integration} connection will be enabled after OAuth setup`)}
          >
            {t('connect')}
          </button>
        </div>
      ))}
    </div>
  );
}

function TeamView({ t }: { t: (key: TranslationKey) => string }) {
  return (
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold tracking-normal">{t('teamPermissions')}</h2>
      <div className="mt-5 grid gap-3">
        {demoUsers.map((user) => (
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

function ActivityView({ t }: { t: (key: TranslationKey) => string }) {
  return (
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold tracking-normal">{t('activityTimeline')}</h2>
      <div className="mt-5 grid gap-3">
        {activities.map((item) => (
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
  currentUser: (typeof demoUsers)[number];
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
          <span className="text-sm font-semibold text-slate-700">Name</span>
          <input
            className="mt-2 h-11 w-full rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
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
        ['Organization', 'Acme Studio workspace profile and industry settings.'],
        ['Security', 'Role permissions, audit logs, and source authorization.'],
        ['AI provider', 'Provider-independent assistant settings and token tracking.'],
      ].map(([title, body]) => (
        <div key={title} className="rounded-ui border border-line bg-white p-5 shadow-sm">
          <ShieldCheck className="text-teal" size={22} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold tracking-normal">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          <button
            className="mt-4 h-9 rounded-ui border border-line px-3 text-sm font-semibold text-slate-700"
            type="button"
            onClick={() => showNotice(`${title} settings saved locally`)}
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
  t,
}: {
  onAsk: (question: string) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="rounded-ui border border-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold tracking-normal">{t('activeProjects')}</h2>
      <div className="mt-4 overflow-hidden rounded-ui border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Risk</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Action</th>
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
                    Ask why
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

function RiskPanel({ t }: { t: (key: TranslationKey) => string }) {
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
