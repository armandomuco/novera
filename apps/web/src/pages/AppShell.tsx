import {
  Activity,
  Bot,
  Building2,
  FileText,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  Plug,
  Search,
  Settings,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clearAuth, switchOrganization, updateCurrentUser } from '../api/authApi';
import {
  archiveProductionKnowledgeItem,
  archiveProductionProject,
  askProductionAssistant,
  cancelProductionInvitation,
  createProductionInvitation,
  createProductionKnowledgeItem,
  createProductionProject,
  downloadProductionDocument,
  fetchProductionWorkspace,
  hasAuthenticatedSession,
  reprocessProductionDocument,
  searchProductionDocuments,
  updateProductionKnowledgeItem,
  updateProductionOrganization,
  updateProductionProject,
  uploadProductionDocument,
} from '../api/productionApi';
import type { AssistantAnswer } from '../api/productionApi';
import type { ProjectUpdate, WorkspaceData } from '../api/workspaceTypes';
import { LanguageSelector } from '../components/LanguageSelector';
import { Logo } from '../components/Logo';
import {
  activities,
  demoUsers,
  documents,
  getDemoUserByEmail,
  knowledgeItems,
  projects,
} from '../data/demoWorkspace';
import { ActivityView } from '../features/activity/ActivityView';
import { AssistantView } from '../features/assistant/AssistantView';
import { DashboardView } from '../features/dashboard/DashboardView';
import { DocumentsView } from '../features/documents/DocumentsView';
import { IntegrationsView } from '../features/integrations/IntegrationsView';
import { KnowledgeView } from '../features/knowledge/KnowledgeView';
import { ProfileView } from '../features/profile/ProfileView';
import { ProjectsView } from '../features/projects/ProjectsView';
import { SettingsView } from '../features/settings/SettingsView';
import { TeamView } from '../features/team/TeamView';
import { translate, type TranslationKey } from '../i18n';

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

const appViews = [...navItems.map((item) => item.view), 'Profile'];

/** Each view has its own URL: `/app` is the dashboard, other views live at `/app/<view>`. */
function viewPath(view: string) {
  return view === 'Dashboard' ? '/app' : `/app/${view.toLowerCase()}`;
}

function viewFromSection(section: string | undefined) {
  return appViews.find((view) => view.toLowerCase() === section?.toLowerCase());
}

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
  const { section } = useParams();
  const activeView = viewFromSection(section) ?? 'Dashboard';
  const [language, setLanguage] = useState(window.localStorage.getItem('novera-language') ?? 'en');
  const [query, setQuery] = useState('');
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState<AssistantAnswer | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const latestQuestionRef = useRef(0);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [notice, setNotice] = useState('');
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  const t = (key: TranslationKey) => translate(language, key);

  useEffect(() => {
    if (section && !viewFromSection(section)) {
      navigate(viewPath('Dashboard'), { replace: true });
    }
  }, [navigate, section]);

  useEffect(() => {
    let isMounted = true;
    if (!hasAuthenticatedSession()) {
      window.localStorage.removeItem('novera-demo-user');
      navigate('/login');
      return () => {
        isMounted = false;
      };
    }
    setIsLoadingWorkspace(true);
    fetchProductionWorkspace()
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
    organization: {
      id: undefined,
      name: 'Acme Studio',
      slug: 'acme-studio',
      industry: 'Digital agency',
    },
    organizations: [],
    users: demoUsers,
    invitations: [],
    projects,
    knowledgeItems,
    documents,
    dashboard: null,
    activities,
    source: 'fallback' as const,
  };

  const hasDocumentsProcessing = Boolean(
    workspace?.documents.some((document) =>
      ['Processing queued', 'Processing', 'Uploading'].includes(document.status),
    ),
  );

  useEffect(() => {
    if (!hasDocumentsProcessing) {
      return;
    }
    let isMounted = true;
    const timer = window.setInterval(() => {
      fetchProductionWorkspace()
        .then((data) => {
          if (isMounted) setWorkspace(data);
        })
        .catch(() => undefined);
    }, 2500);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [hasDocumentsProcessing]);

  const filteredKnowledge = useMemo(() => {
    const normalized = query.toLowerCase();
    return workspaceData.knowledgeItems.filter((item) =>
      [item.title, item.summary, item.type, item.project]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, workspaceData.knowledgeItems]);

  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem('novera-language', value);
    setAssistantQuestion('');
    setAssistantAnswer(null);
    showNotice(`${translate(value, 'languageChanged')}: ${value.toUpperCase()}`);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function replaceWorkspace(data: WorkspaceData, message: string) {
    setWorkspace(data);
    showNotice(data.source === 'api' ? message : `${message} locally`);
  }

  async function askAssistant(question: string) {
    const trimmed = question.trim();
    setAssistantQuestion(question);
    navigate(viewPath('Assistant'));
    if (!trimmed) return;
    // Only the most recent question may update the answer, even if an earlier one returns later.
    const requestId = ++latestQuestionRef.current;
    setIsAsking(true);
    setAssistantAnswer(null);
    try {
      const answer = await askProductionAssistant({ question: trimmed, language });
      if (requestId === latestQuestionRef.current) setAssistantAnswer(answer);
    } catch {
      if (requestId === latestQuestionRef.current) showNotice(t('assistantAskFailed'));
    } finally {
      if (requestId === latestQuestionRef.current) setIsAsking(false);
    }
  }

  function logout() {
    clearAuth();
    window.localStorage.removeItem('novera-demo-user');
    navigate('/login');
  }

  function openView(view: string) {
    navigate(viewPath(view));
    setIsMobileNavigationOpen(false);
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
      const data = await createProductionProject(input);
      replaceWorkspace(data, t('projectCreated'));
      return true;
    } catch {
      showNotice(t('saveFailed'));
      return false;
    }
  }

  async function updateProject(input: ProjectUpdate) {
    try {
      const data = await updateProductionProject(input);
      replaceWorkspace(data, t('projectUpdated'));
      return true;
    } catch {
      showNotice(t('saveFailed'));
      return false;
    }
  }

  async function archiveProject(projectId: string) {
    try {
      const data = await archiveProductionProject(projectId);
      replaceWorkspace(data, t('projectArchived'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function createKnowledge(input: { title: string; type: string; summary: string }) {
    try {
      const data = await createProductionKnowledgeItem(input);
      replaceWorkspace(data, t('knowledgeItemCreated'));
      return true;
    } catch {
      showNotice(t('saveFailed'));
      return false;
    }
  }

  async function updateKnowledge(input: {
    id: string;
    title: string;
    type: string;
    summary: string;
  }) {
    try {
      const data = await updateProductionKnowledgeItem(input.id, input);
      replaceWorkspace(data, t('knowledgeUpdated'));
      return true;
    } catch {
      showNotice(t('saveFailed'));
      return false;
    }
  }

  async function archiveKnowledge(itemId: string) {
    try {
      const data = await archiveProductionKnowledgeItem(itemId);
      replaceWorkspace(data, t('knowledgeArchived'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function createDocument(input: { title: string; file: File }) {
    try {
      const data = await uploadProductionDocument(input);
      replaceWorkspace(data, t('documentUploaded'));
      return true;
    } catch {
      showNotice(t('saveFailed'));
      return false;
    }
  }

  async function downloadDocument(documentId: string, title: string) {
    try {
      await downloadProductionDocument(documentId, title);
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function reprocessDocument(documentId: string) {
    try {
      const data = await reprocessProductionDocument(documentId);
      replaceWorkspace(data, t('documentRequeued'));
    } catch {
      showNotice(t('saveFailed'));
    }
  }

  async function searchDocuments(query: string) {
    try {
      return await searchProductionDocuments(query);
    } catch {
      showNotice(t('searchFailed'));
      return [];
    }
  }

  async function saveOrganizationSettings(input: {
    name: string;
    industry: string;
    aiProvider: string;
  }) {
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

  async function inviteTeamMember(input: { email: string; role: string }) {
    if (!workspaceData.organization.id || !hasAuthenticatedSession()) {
      showNotice(t('inviteRequiresLiveWorkspace'));
      return false;
    }
    try {
      const result = await createProductionInvitation({
        organizationId: workspaceData.organization.id,
        ...input,
      });
      replaceWorkspace(result.workspace, t('invitationCreated'));
      return true;
    } catch {
      showNotice(t('saveFailed'));
      return false;
    }
  }

  async function changeOrganization(organizationId: string) {
    if (!organizationId || organizationId === workspaceData.organization.id) {
      return;
    }
    setIsLoadingWorkspace(true);
    try {
      const auth = await switchOrganization(organizationId);
      setCurrentUser({ ...currentUser, ...auth.user, focus: currentUser.focus });
      const data = await fetchProductionWorkspace();
      setWorkspace(data);
      navigate(viewPath('Dashboard'));
      showNotice(t('organizationSwitched'));
    } catch {
      showNotice(t('organizationSwitchFailed'));
    } finally {
      setIsLoadingWorkspace(false);
    }
  }

  async function cancelTeamInvitation(invitationId: string) {
    if (!workspaceData.organization.id || !hasAuthenticatedSession()) {
      showNotice(t('inviteRequiresLiveWorkspace'));
      return;
    }
    try {
      const data = await cancelProductionInvitation({
        organizationId: workspaceData.organization.id,
        invitationId,
      });
      replaceWorkspace(data, t('invitationCancelled'));
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
                onClick={() => openView(item.view)}
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
              onClick={() => openView('Profile')}
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

      {isMobileNavigationOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-navy/55"
            type="button"
            aria-label={t('closeNavigation')}
            onClick={() => setIsMobileNavigationOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[86vw] bg-navy px-4 py-5 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 [&_*]:text-white">
              <Logo />
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-ui border border-white/15 bg-white/10"
                type="button"
                aria-label={t('closeNavigation')}
                onClick={() => setIsMobileNavigationOpen(false)}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-8 space-y-1" aria-label={t('mainNavigation')}>
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
                    onClick={() => openView(item.view)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {t(item.key)}
                  </button>
                );
              })}
            </nav>
            <div className="absolute bottom-5 left-4 right-4 rounded-ui border border-white/10 bg-white/8 p-3">
              <p className="text-sm font-bold text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-300">{currentUser.role}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-ui border border-white/15 bg-white/10 text-xs font-semibold text-white"
                  type="button"
                  onClick={() => openView('Profile')}
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
        </div>
      ) : null}

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-line bg-white/88 px-6 py-3 shadow-sm backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="secondary-action inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ui lg:hidden"
              type="button"
              aria-label={t('openNavigation')}
              onClick={() => setIsMobileNavigationOpen(true)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="min-w-0">
              {(workspaceData.organizations?.length ?? 0) > 1 ? (
                <label className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                  <Building2 size={15} aria-hidden="true" />
                  <span className="sr-only">{t('switchOrganization')}</span>
                  <select
                    className="border-0 bg-transparent pr-2 text-sm font-semibold text-slate-600 outline-none"
                    aria-label={t('switchOrganization')}
                    value={workspaceData.organization.id}
                    onChange={(event) => changeOrganization(event.target.value)}
                  >
                    {workspaceData.organizations?.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-sm text-slate-500">{workspaceData.organization.name}</p>
              )}
              <h1 className="text-xl font-bold tracking-normal">
                {activeView === 'Profile'
                  ? t('profile')
                  : t(navItems.find((item) => item.view === activeView)?.key ?? 'dashboard')}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector
              value={language}
              onChange={changeLanguage}
              label={t('selectLanguage')}
            />
            <button
              className="primary-action inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
              type="button"
              onClick={() => askAssistant(t('assistantQuestionFocus'))}
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
              isAsking={isAsking}
              onAsk={askAssistant}
              onDownloadDocument={downloadDocument}
              question={assistantQuestion}
              setQuestion={setAssistantQuestion}
              t={t}
            />
          ) : activeView === 'Projects' ? (
            <ProjectsView
              data={workspaceData}
              canEdit={
                hasAuthenticatedSession() &&
                ['Owner', 'Administrator', 'Manager'].includes(currentUser.role)
              }
              onArchiveProject={archiveProject}
              onAsk={askAssistant}
              onCreateProject={createProject}
              onUpdateProject={updateProject}
              t={t}
            />
          ) : activeView === 'Knowledge' ? (
            <KnowledgeView
              canEdit={
                hasAuthenticatedSession() &&
                ['Owner', 'Administrator', 'Manager', 'Member'].includes(currentUser.role)
              }
              items={filteredKnowledge}
              onArchiveKnowledge={archiveKnowledge}
              onCreateKnowledge={createKnowledge}
              onUpdateKnowledge={updateKnowledge}
              query={query}
              setQuery={setQuery}
              t={t}
            />
          ) : activeView === 'Documents' ? (
            <DocumentsView
              canUpload={
                hasAuthenticatedSession() &&
                ['Owner', 'Administrator', 'Manager', 'Member'].includes(currentUser.role)
              }
              data={workspaceData}
              onDownloadDocument={downloadDocument}
              onCreateDocument={createDocument}
              onReprocessDocument={reprocessDocument}
              onSearchDocuments={searchDocuments}
              t={t}
            />
          ) : activeView === 'Integrations' ? (
            <IntegrationsView t={t} />
          ) : activeView === 'Team' ? (
            <TeamView
              canManage={['Owner', 'Administrator', 'Manager'].includes(currentUser.role)}
              data={workspaceData}
              onCancelInvitation={cancelTeamInvitation}
              onInvite={inviteTeamMember}
              t={t}
            />
          ) : activeView === 'Activity' ? (
            <ActivityView data={workspaceData} t={t} />
          ) : activeView === 'Profile' ? (
            <ProfileView currentUser={currentUser} onSave={saveProfile} t={t} />
          ) : (
            <SettingsView
              canEdit={['Owner', 'Administrator'].includes(currentUser.role)}
              data={workspaceData}
              onSave={saveOrganizationSettings}
              t={t}
            />
          )}
        </section>
      </main>
    </div>
  );
}
