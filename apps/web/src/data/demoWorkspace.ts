export type LanguageOption = {
  code: string;
  name: string;
  flag: string;
};

export type TranslationKey =
  | 'dashboard'
  | 'assistant'
  | 'projects'
  | 'knowledge'
  | 'documents'
  | 'integrations'
  | 'team'
  | 'activity'
  | 'settings'
  | 'profile'
  | 'logout'
  | 'askNovera'
  | 'activeProjects'
  | 'openRisks'
  | 'recentDecisions'
  | 'managementPriorities'
  | 'thisWeek'
  | 'explainPriorities'
  | 'businessTwin'
  | 'liveKnowledgeMap'
  | 'searchCompanyMemory'
  | 'uploadDocument'
  | 'connect'
  | 'saveChanges'
  | 'currentRisks'
  | 'teamPermissions'
  | 'activityTimeline';

export type DemoUser = {
  role: string;
  name: string;
  email: string;
  password: string;
  focus: string;
};

export type Project = {
  name: string;
  status: string;
  risk: string;
  owner: string;
  due: string;
  progress: number;
  summary: string;
};

export type ActivityItem = {
  actor: string;
  action: string;
  target: string;
  time: string;
};

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const demoUsers: DemoUser[] = [
  {
    role: 'Owner',
    name: 'Olivia Stone',
    email: 'owner@novera.test',
    password: 'DemoPass123!',
    focus: 'Company priorities, risks, and team decisions.',
  },
  {
    role: 'Administrator',
    name: 'Adrian Vale',
    email: 'admin@novera.test',
    password: 'DemoPass123!',
    focus: 'Members, integrations, organization settings, and permissions.',
  },
  {
    role: 'Manager',
    name: 'Mira Chen',
    email: 'manager@novera.test',
    password: 'DemoPass123!',
    focus: 'Project delivery, blockers, risks, and customer updates.',
  },
  {
    role: 'Member',
    name: 'Leo Marin',
    email: 'member@novera.test',
    password: 'DemoPass123!',
    focus: 'Documents, notes, meeting summaries, and project updates.',
  },
  {
    role: 'Viewer',
    name: 'Vera Holt',
    email: 'viewer@novera.test',
    password: 'DemoPass123!',
    focus: 'Read-only view for permission demos.',
  },
];

export const projects: Project[] = [
  {
    name: 'Atlas onboarding',
    status: 'Delayed',
    risk: 'High',
    owner: 'Mira Chen',
    due: 'Aug 5',
    progress: 62,
    summary: 'Blocked by missing CRM export credentials. Customer escalation is open.',
  },
  {
    name: 'Q3 retainer',
    status: 'On track',
    risk: 'Medium',
    owner: 'Adrian Vale',
    due: 'Aug 15',
    progress: 78,
    summary: 'Scope is nearly approved. Staffing allocation still needs confirmation.',
  },
  {
    name: 'Finance portal',
    status: 'Review',
    risk: 'Low',
    owner: 'Leo Marin',
    due: 'Sep 1',
    progress: 44,
    summary: 'Requirements review is active. Permissions model is the next decision.',
  },
];

export const knowledgeItems = [
  {
    type: 'Decision',
    title: 'Delay Atlas launch by one week',
    source: 'Management meeting',
    summary: 'Launch was moved because CRM export access is still missing.',
    project: 'Atlas onboarding',
  },
  {
    type: 'Meeting',
    title: 'Atlas onboarding blockers',
    source: 'Client success call',
    summary: 'Data import cannot begin until customer export credentials arrive.',
    project: 'Atlas onboarding',
  },
  {
    type: 'Note',
    title: 'Q3 retainer priorities',
    source: 'Manager note',
    summary: 'Focus on final scope, staffing, and delivery cadence.',
    project: 'Q3 retainer',
  },
  {
    type: 'Process',
    title: 'Client document review workflow',
    source: 'Operations handbook',
    summary: 'Documents move from upload to extraction, summary, approval, and archive.',
    project: 'Finance portal',
  },
];

export const documents = [
  {
    title: 'Atlas onboarding checklist',
    type: 'Markdown',
    status: 'Summarized',
    project: 'Atlas onboarding',
    updated: 'Today',
  },
  {
    title: 'Q3 retainer scope',
    type: 'PDF',
    status: 'Summarized',
    project: 'Q3 retainer',
    updated: 'Yesterday',
  },
  {
    title: 'Finance permissions draft',
    type: 'DOCX',
    status: 'Needs review',
    project: 'Finance portal',
    updated: '2 days ago',
  },
];

export const risks = [
  {
    title: 'CRM export credentials still missing',
    severity: 'High',
    owner: 'Mira Chen',
    mitigation: 'Escalate to customer sponsor and prepare fallback CSV import path.',
  },
  {
    title: 'Staffing overlap during Q3 delivery',
    severity: 'Medium',
    owner: 'Adrian Vale',
    mitigation: 'Confirm allocation before final retainer approval.',
  },
];

export const activities: ActivityItem[] = [
  {
    actor: 'Mira Chen',
    action: 'changed project status',
    target: 'Atlas onboarding',
    time: '12 min ago',
  },
  {
    actor: 'Olivia Stone',
    action: 'added decision',
    target: 'Delay Atlas launch by one week',
    time: '38 min ago',
  },
  {
    actor: 'Leo Marin',
    action: 'uploaded document',
    target: 'Atlas onboarding checklist',
    time: '1 hr ago',
  },
  {
    actor: 'Adrian Vale',
    action: 'created risk',
    target: 'Staffing overlap during Q3 delivery',
    time: '2 hrs ago',
  },
];

export const assistantQuestions = [
  'Why is Atlas onboarding delayed?',
  'What changed this month?',
  'What should management focus on this week?',
  'Where is the latest Atlas document?',
];

export const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    dashboard: 'Dashboard',
    assistant: 'Assistant',
    projects: 'Projects',
    knowledge: 'Knowledge',
    documents: 'Documents',
    integrations: 'Integrations',
    team: 'Team',
    activity: 'Activity',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Log out',
    askNovera: 'Ask Novera',
    activeProjects: 'Active projects',
    openRisks: 'Open risks',
    recentDecisions: 'Recent decisions',
    managementPriorities: 'Management priorities',
    thisWeek: 'This week',
    explainPriorities: 'Explain priorities',
    businessTwin: 'Business twin',
    liveKnowledgeMap: 'Live knowledge map',
    searchCompanyMemory: 'Search company memory',
    uploadDocument: 'Upload document',
    connect: 'Connect',
    saveChanges: 'Save changes',
    currentRisks: 'Current risks',
    teamPermissions: 'Team and permissions',
    activityTimeline: 'Activity timeline',
  },
  sq: {
    dashboard: 'Paneli',
    assistant: 'Asistenti',
    projects: 'Projektet',
    knowledge: 'Njohuria',
    documents: 'Dokumentet',
    integrations: 'Integrimet',
    team: 'Ekipi',
    activity: 'Aktiviteti',
    settings: 'Cilësimet',
    profile: 'Profili',
    logout: 'Dil',
    askNovera: 'Pyet Novera',
    activeProjects: 'Projektet aktive',
    openRisks: 'Rreziqet e hapura',
    recentDecisions: 'Vendimet e fundit',
    managementPriorities: 'Prioritetet e menaxhimit',
    thisWeek: 'Këtë javë',
    explainPriorities: 'Shpjego prioritetet',
    businessTwin: 'Binjaku i biznesit',
    liveKnowledgeMap: 'Harta e njohurisë',
    searchCompanyMemory: 'Kërko në kujtesën e kompanisë',
    uploadDocument: 'Ngarko dokument',
    connect: 'Lidhu',
    saveChanges: 'Ruaj ndryshimet',
    currentRisks: 'Rreziqet aktuale',
    teamPermissions: 'Ekipi dhe lejet',
    activityTimeline: 'Historia e aktivitetit',
  },
  it: {
    dashboard: 'Dashboard',
    assistant: 'Assistente',
    projects: 'Progetti',
    knowledge: 'Conoscenza',
    documents: 'Documenti',
    integrations: 'Integrazioni',
    team: 'Team',
    activity: 'Attività',
    settings: 'Impostazioni',
    profile: 'Profilo',
    logout: 'Esci',
    askNovera: 'Chiedi a Novera',
    activeProjects: 'Progetti attivi',
    openRisks: 'Rischi aperti',
    recentDecisions: 'Decisioni recenti',
    managementPriorities: 'Priorità di gestione',
    thisWeek: 'Questa settimana',
    explainPriorities: 'Spiega priorità',
    businessTwin: 'Gemello aziendale',
    liveKnowledgeMap: 'Mappa conoscenza',
    searchCompanyMemory: 'Cerca nella memoria aziendale',
    uploadDocument: 'Carica documento',
    connect: 'Connetti',
    saveChanges: 'Salva modifiche',
    currentRisks: 'Rischi attuali',
    teamPermissions: 'Team e permessi',
    activityTimeline: 'Cronologia attività',
  },
  de: {
    dashboard: 'Dashboard',
    assistant: 'Assistent',
    projects: 'Projekte',
    knowledge: 'Wissen',
    documents: 'Dokumente',
    integrations: 'Integrationen',
    team: 'Team',
    activity: 'Aktivität',
    settings: 'Einstellungen',
    profile: 'Profil',
    logout: 'Abmelden',
    askNovera: 'Novera fragen',
    activeProjects: 'Aktive Projekte',
    openRisks: 'Offene Risiken',
    recentDecisions: 'Neue Entscheidungen',
    managementPriorities: 'Managementprioritäten',
    thisWeek: 'Diese Woche',
    explainPriorities: 'Prioritäten erklären',
    businessTwin: 'Business Twin',
    liveKnowledgeMap: 'Live-Wissenskarte',
    searchCompanyMemory: 'Firmengedächtnis suchen',
    uploadDocument: 'Dokument hochladen',
    connect: 'Verbinden',
    saveChanges: 'Änderungen speichern',
    currentRisks: 'Aktuelle Risiken',
    teamPermissions: 'Team und Rechte',
    activityTimeline: 'Aktivitätsverlauf',
  },
  fr: {
    dashboard: 'Tableau de bord',
    assistant: 'Assistant',
    projects: 'Projets',
    knowledge: 'Connaissance',
    documents: 'Documents',
    integrations: 'Intégrations',
    team: 'Équipe',
    activity: 'Activité',
    settings: 'Paramètres',
    profile: 'Profil',
    logout: 'Déconnexion',
    askNovera: 'Demander à Novera',
    activeProjects: 'Projets actifs',
    openRisks: 'Risques ouverts',
    recentDecisions: 'Décisions récentes',
    managementPriorities: 'Priorités de gestion',
    thisWeek: 'Cette semaine',
    explainPriorities: 'Expliquer les priorités',
    businessTwin: 'Jumeau métier',
    liveKnowledgeMap: 'Carte de connaissance',
    searchCompanyMemory: 'Rechercher la mémoire',
    uploadDocument: 'Importer document',
    connect: 'Connecter',
    saveChanges: 'Enregistrer',
    currentRisks: 'Risques actuels',
    teamPermissions: 'Équipe et permissions',
    activityTimeline: 'Fil d’activité',
  },
};

export function translate(language: string, key: TranslationKey) {
  return translations[language]?.[key] ?? translations.en[key];
}

export function getDemoUserByEmail(email: string) {
  return demoUsers.find((user) => user.email === email) ?? demoUsers[0];
}
