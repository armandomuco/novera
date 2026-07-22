import crypto from 'node:crypto';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/novera';
const DEMO_PASSWORD = 'DemoPass123!';

const auditFields = {
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

const schemas = {
  User: new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true, index: true },
      passwordHash: { type: String, required: true },
      name: { type: String, required: true },
      roleLabel: { type: String, required: true },
      status: { type: String, required: true },
      emailVerifiedAt: { type: Date, default: null },
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    { collection: 'users' },
  ),
  Organization: new mongoose.Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      industry: String,
      settings: Object,
      createdBy: mongoose.Schema.Types.ObjectId,
      updatedBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    { collection: 'organizations' },
  ),
  OrganizationMember: new mongoose.Schema(
    {
      organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      role: { type: String, required: true },
      status: { type: String, required: true },
      joinedAt: Date,
      createdAt: Date,
      updatedAt: Date,
    },
    { collection: 'organizationMembers' },
  ),
  Project: new mongoose.Schema(
    {
      organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      name: { type: String, required: true },
      status: { type: String, required: true },
      description: String,
      objectives: [String],
      ownerName: String,
      riskLevel: String,
      dueDate: Date,
      createdBy: mongoose.Schema.Types.ObjectId,
      updatedBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    { collection: 'projects' },
  ),
  KnowledgeItem: new mongoose.Schema(
    {
      organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      projectId: { type: mongoose.Schema.Types.ObjectId, index: true },
      title: { type: String, required: true },
      content: String,
      type: { type: String, required: true },
      source: String,
      tags: [String],
      aiSummary: String,
      embeddingStatus: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      updatedBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    { collection: 'knowledgeItems' },
  ),
  Document: new mongoose.Schema(
    {
      organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      projectId: { type: mongoose.Schema.Types.ObjectId, index: true },
      title: { type: String, required: true },
      fileName: String,
      mimeType: String,
      sizeBytes: Number,
      processingStatus: String,
      aiSummary: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      updatedBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    { collection: 'documents' },
  ),
  Risk: new mongoose.Schema(
    {
      organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      projectId: { type: mongoose.Schema.Types.ObjectId, index: true },
      title: { type: String, required: true },
      severity: String,
      likelihood: String,
      status: String,
      mitigation: String,
      ownerName: String,
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    { collection: 'risks' },
  ),
  ActivityEvent: new mongoose.Schema(
    {
      organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      actorName: String,
      eventType: String,
      entityType: String,
      entityName: String,
      metadata: Object,
      createdAt: Date,
    },
    { collection: 'activityEvents' },
  ),
};

const User = mongoose.model('SeedUser', schemas.User);
const Organization = mongoose.model('SeedOrganization', schemas.Organization);
const OrganizationMember = mongoose.model('SeedOrganizationMember', schemas.OrganizationMember);
const Project = mongoose.model('SeedProject', schemas.Project);
const KnowledgeItem = mongoose.model('SeedKnowledgeItem', schemas.KnowledgeItem);
const Document = mongoose.model('SeedDocument', schemas.Document);
const Risk = mongoose.model('SeedRisk', schemas.Risk);
const ActivityEvent = mongoose.model('SeedActivityEvent', schemas.ActivityEvent);

const demoUsers = [
  ['Owner', 'Olivia Stone', 'owner@novera.test'],
  ['Administrator', 'Adrian Vale', 'admin@novera.test'],
  ['Manager', 'Mira Chen', 'manager@novera.test'],
  ['Member', 'Leo Marin', 'member@novera.test'],
  ['Viewer', 'Vera Holt', 'viewer@novera.test'],
];

async function upsertDemoData() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  const users = new Map();
  for (const [roleLabel, name, email] of demoUsers) {
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name,
          roleLabel,
          status: 'active',
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        $setOnInsert: {
          passwordHash: hashPassword(DEMO_PASSWORD),
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
    users.set(roleLabel, user);
  }

  const owner = users.get('Owner');
  const organization = await Organization.findOneAndUpdate(
    { slug: 'acme-studio' },
    {
      $set: {
        name: 'Acme Studio',
        slug: 'acme-studio',
        industry: 'Digital agency',
        settings: {
          language: 'English',
          aiProvider: 'mock',
          dataRetention: 'mvp-demo',
        },
        createdBy: owner._id,
        updatedBy: owner._id,
        ...auditFields,
      },
    },
    { upsert: true, new: true },
  );

  for (const [roleLabel] of demoUsers) {
    const user = users.get(roleLabel);
    await OrganizationMember.findOneAndUpdate(
      { organizationId: organization._id, userId: user._id },
      {
        $set: {
          role: roleLabel,
          status: 'active',
          joinedAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          organizationId: organization._id,
          userId: user._id,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  const projectSeeds = [
    {
      name: 'Atlas onboarding',
      status: 'Delayed',
      description: 'Customer onboarding project blocked by missing CRM export credentials.',
      objectives: ['Import customer data', 'Approve onboarding checklist', 'Launch customer portal'],
      ownerName: 'Mira Chen',
      riskLevel: 'High',
      dueDate: new Date('2026-08-05'),
    },
    {
      name: 'Q3 retainer',
      status: 'On track',
      description: 'Quarterly consulting retainer scope and delivery planning.',
      objectives: ['Confirm priorities', 'Approve budget', 'Schedule delivery cadence'],
      ownerName: 'Adrian Vale',
      riskLevel: 'Medium',
      dueDate: new Date('2026-08-15'),
    },
    {
      name: 'Finance portal',
      status: 'Review',
      description: 'Internal portal for finance documentation and approval workflows.',
      objectives: ['Review requirements', 'Finalize permissions', 'Prepare first demo'],
      ownerName: 'Leo Marin',
      riskLevel: 'Low',
      dueDate: new Date('2026-09-01'),
    },
  ];

  const projects = new Map();
  for (const seed of projectSeeds) {
    const project = await Project.findOneAndUpdate(
      { organizationId: organization._id, name: seed.name },
      {
        $set: {
          ...seed,
          organizationId: organization._id,
          createdBy: owner._id,
          updatedBy: owner._id,
          ...auditFields,
        },
      },
      { upsert: true, new: true },
    );
    projects.set(seed.name, project);
  }

  const atlas = projects.get('Atlas onboarding');
  const q3 = projects.get('Q3 retainer');
  const finance = projects.get('Finance portal');

  const knowledgeSeeds = [
    {
      projectId: atlas._id,
      title: 'Decision: delay Atlas launch by one week',
      type: 'decision',
      source: 'Management meeting',
      content:
        'The team agreed to delay Atlas launch by one week because CRM export credentials are still missing.',
      tags: ['atlas', 'launch', 'decision'],
      aiSummary: 'Atlas launch delayed by one week due to missing CRM credentials.',
    },
    {
      projectId: atlas._id,
      title: 'Meeting summary: Atlas onboarding blockers',
      type: 'meeting_summary',
      source: 'Client success call',
      content:
        'Client success confirmed that data import cannot start until the customer sends export access.',
      tags: ['atlas', 'meeting', 'blocker'],
      aiSummary: 'Data import is blocked until export access is received.',
    },
    {
      projectId: q3._id,
      title: 'Q3 retainer priorities',
      type: 'note',
      source: 'Manager note',
      content:
        'The management team should focus on scope approval, delivery cadence, and two open staffing questions.',
      tags: ['retainer', 'priorities'],
      aiSummary: 'Q3 retainer is on track but needs staffing confirmation.',
    },
    {
      projectId: finance._id,
      title: 'Client document review workflow',
      type: 'process',
      source: 'Operations handbook',
      content:
        'Documents move from upload to extraction, summary, approval, and archive. Restricted project files require explicit access.',
      tags: ['documents', 'process', 'permissions'],
      aiSummary: 'Document review includes extraction, summary, approval, archive, and access checks.',
    },
  ];

  for (const seed of knowledgeSeeds) {
    await KnowledgeItem.findOneAndUpdate(
      { organizationId: organization._id, title: seed.title },
      {
        $set: {
          ...seed,
          organizationId: organization._id,
          embeddingStatus: 'pending',
          createdBy: owner._id,
          updatedBy: owner._id,
          ...auditFields,
        },
      },
      { upsert: true },
    );
  }

  const documents = [
    {
      projectId: atlas._id,
      title: 'Atlas onboarding checklist',
      fileName: 'atlas-onboarding-checklist.md',
      mimeType: 'text/markdown',
      sizeBytes: 18400,
      processingStatus: 'summarized',
      aiSummary: 'Checklist for launch readiness, data import, owner approvals, and risk review.',
    },
    {
      projectId: q3._id,
      title: 'Q3 retainer scope',
      fileName: 'q3-retainer-scope.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 245760,
      processingStatus: 'summarized',
      aiSummary: 'Scope proposal for Q3 advisory and delivery support.',
    },
    {
      projectId: finance._id,
      title: 'Finance permissions draft',
      fileName: 'finance-permissions-draft.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 98304,
      processingStatus: 'needs_review',
      aiSummary: 'Draft permissions model for finance portal document access.',
    },
  ];

  for (const seed of documents) {
    await Document.findOneAndUpdate(
      { organizationId: organization._id, title: seed.title },
      {
        $set: {
          ...seed,
          organizationId: organization._id,
          createdBy: owner._id,
          updatedBy: owner._id,
          ...auditFields,
        },
      },
      { upsert: true },
    );
  }

  const risks = [
    {
      projectId: atlas._id,
      title: 'CRM export credentials still missing',
      severity: 'High',
      likelihood: 'Medium',
      status: 'Open',
      mitigation: 'Escalate to customer sponsor and prepare fallback CSV import path.',
      ownerName: 'Mira Chen',
    },
    {
      projectId: q3._id,
      title: 'Staffing overlap during Q3 delivery',
      severity: 'Medium',
      likelihood: 'Medium',
      status: 'Monitoring',
      mitigation: 'Confirm allocation before final scope approval.',
      ownerName: 'Adrian Vale',
    },
  ];

  for (const seed of risks) {
    await Risk.findOneAndUpdate(
      { organizationId: organization._id, title: seed.title },
      {
        $set: {
          ...seed,
          organizationId: organization._id,
          ...auditFields,
        },
      },
      { upsert: true },
    );
  }

  const activities = [
    ['Mira Chen', 'project.status_changed', 'project', 'Atlas onboarding'],
    ['Olivia Stone', 'decision.added', 'decision', 'Delay Atlas launch by one week'],
    ['Leo Marin', 'document.uploaded', 'document', 'Atlas onboarding checklist'],
    ['Adrian Vale', 'risk.created', 'risk', 'Staffing overlap during Q3 delivery'],
  ];

  await ActivityEvent.deleteMany({ organizationId: organization._id });
  for (const [actorName, eventType, entityType, entityName] of activities) {
    await ActivityEvent.create({
      organizationId: organization._id,
      actorName,
      eventType,
      entityType,
      entityName,
      metadata: { source: 'demo-seed' },
      createdAt: new Date(),
    });
  }

  const counts = {
    users: await User.countDocuments({ email: /@novera\.test$/ }),
    organizations: await Organization.countDocuments({ slug: 'acme-studio' }),
    organizationMembers: await OrganizationMember.countDocuments({ organizationId: organization._id }),
    projects: await Project.countDocuments({ organizationId: organization._id }),
    knowledgeItems: await KnowledgeItem.countDocuments({ organizationId: organization._id }),
    documents: await Document.countDocuments({ organizationId: organization._id }),
    risks: await Risk.countDocuments({ organizationId: organization._id }),
    activityEvents: await ActivityEvent.countDocuments({ organizationId: organization._id }),
  };

  console.log(JSON.stringify({ database: mongoose.connection.name, uri: MONGODB_URI, counts }, null, 2));
}

upsertDemoData()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
