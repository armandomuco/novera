export type DemoUser = {
  role: string;
  name: string;
  email: string;
  password: string;
  focus: string;
};

export type Project = {
  id: string;
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
    id: 'demo-atlas-onboarding',
    name: 'Atlas onboarding',
    status: 'Delayed',
    risk: 'High',
    owner: 'Mira Chen',
    due: 'Aug 5',
    progress: 62,
    summary: 'Blocked by missing CRM export credentials. Customer escalation is open.',
  },
  {
    id: 'demo-q3-retainer',
    name: 'Q3 retainer',
    status: 'On track',
    risk: 'Medium',
    owner: 'Adrian Vale',
    due: 'Aug 15',
    progress: 78,
    summary: 'Scope is nearly approved. Staffing allocation still needs confirmation.',
  },
  {
    id: 'demo-finance-portal',
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
    id: 'demo-atlas-decision',
    type: 'Decision',
    title: 'Delay Atlas launch by one week',
    source: 'Management meeting',
    summary: 'Launch was moved because CRM export access is still missing.',
    project: 'Atlas onboarding',
  },
  {
    id: 'demo-atlas-meeting',
    type: 'Meeting',
    title: 'Atlas onboarding blockers',
    source: 'Client success call',
    summary: 'Data import cannot begin until customer export credentials arrive.',
    project: 'Atlas onboarding',
  },
  {
    id: 'demo-retainer-note',
    type: 'Note',
    title: 'Q3 retainer priorities',
    source: 'Manager note',
    summary: 'Focus on final scope, staffing, and delivery cadence.',
    project: 'Q3 retainer',
  },
  {
    id: 'demo-review-process',
    type: 'Process',
    title: 'Client document review workflow',
    source: 'Operations handbook',
    summary: 'Documents move from upload to extraction, summary, approval, and archive.',
    project: 'Finance portal',
  },
];

export const documents = [
  {
    id: 'demo-atlas-checklist',
    title: 'Atlas onboarding checklist',
    type: 'Markdown',
    status: 'Summarized',
    project: 'Atlas onboarding',
    updated: 'Today',
  },
  {
    id: 'demo-retainer-scope',
    title: 'Q3 retainer scope',
    type: 'PDF',
    status: 'Summarized',
    project: 'Q3 retainer',
    updated: 'Yesterday',
  },
  {
    id: 'demo-finance-permissions',
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

export function getDemoUserByEmail(email: string) {
  return demoUsers.find((user) => user.email === email) ?? demoUsers[0];
}
