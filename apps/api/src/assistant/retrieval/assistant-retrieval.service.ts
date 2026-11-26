import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentChunk, DocumentChunkDocument } from '../../documents/document-chunks.schemas';
import { Document, DocumentDocument } from '../../documents/documents.schemas';
import { KnowledgeItem, KnowledgeItemDocument } from '../../knowledge/knowledge.schemas';
import { Project, ProjectDocument } from '../../projects/projects.schemas';
import { queryTerms, relevanceScore } from './relevance';

export type RetrievedSource = {
  kind: 'document' | 'knowledge' | 'project';
  entityId: string;
  title: string;
  content: string;
  projectId: string | null;
  projectName: string | null;
  /** Download link for documents; null for records shown inside the app. */
  url: string | null;
  score: number;
};

export type RetrievalResult = {
  terms: string[];
  candidateCount: number;
  sources: RetrievedSource[];
};

const CHUNK_CANDIDATES = 30;
const RECORD_CANDIDATES = 300;
const MAX_SOURCES = 6;
const MAX_SOURCE_CHARACTERS = 2000;

/**
 * Finds the records that best match a question inside one organization.
 * Every query is filtered by the organization id passed in, which the caller takes from the
 * authenticated session after a membership check; nothing from another tenant can be returned.
 */
@Injectable()
export class AssistantRetrievalService {
  constructor(
    @InjectModel(DocumentChunk.name) private readonly chunkModel: Model<DocumentChunkDocument>,
    @InjectModel(Document.name) private readonly documentModel: Model<DocumentDocument>,
    @InjectModel(KnowledgeItem.name) private readonly knowledgeModel: Model<KnowledgeItemDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async retrieve(
    organizationId: string,
    question: string,
    options: { projectId?: string } = {},
  ): Promise<RetrievalResult> {
    const terms = queryTerms(question);
    if (!terms.length) return { terms, candidateCount: 0, sources: [] };

    const tenantId = new Types.ObjectId(organizationId);
    const projectId = options.projectId
      ? await this.requireProject(tenantId, options.projectId)
      : null;

    const projects = await this.projectModel
      .find({ organizationId: tenantId, deletedAt: null, ...(projectId ? { _id: projectId } : {}) })
      .sort({ updatedAt: -1 })
      .limit(RECORD_CANDIDATES)
      .lean();
    const projectNames = new Map(projects.map((project) => [project._id.toString(), project.name]));
    const projectName = (id?: Types.ObjectId | null) =>
      id ? (projectNames.get(id.toString()) ?? null) : null;

    const [chunks, knowledgeItems] = await Promise.all([
      this.chunkModel
        .find(
          {
            organizationId: tenantId,
            ...(projectId ? { projectId } : {}),
            $text: { $search: terms.join(' ') },
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(CHUNK_CANDIDATES)
        .lean(),
      this.knowledgeModel
        .find({ organizationId: tenantId, deletedAt: null, ...(projectId ? { projectId } : {}) })
        .sort({ updatedAt: -1 })
        .limit(RECORD_CANDIDATES)
        .lean(),
    ]);

    const documentIds = [...new Set(chunks.map((chunk) => chunk.documentId.toString()))];
    const documents = documentIds.length
      ? await this.documentModel
          .find({
            _id: { $in: documentIds.map((id) => new Types.ObjectId(id)) },
            organizationId: tenantId,
            deletedAt: null,
          })
          .lean()
      : [];
    const documentsById = new Map(documents.map((document) => [document._id.toString(), document]));

    const candidates: RetrievedSource[] = [
      ...chunks.flatMap((chunk) => {
        const document = documentsById.get(chunk.documentId.toString());
        if (!document) return [];
        const id = document._id.toString();
        return [
          {
            kind: 'document' as const,
            entityId: id,
            title: document.title,
            content: chunk.content,
            projectId: document.projectId?.toString() ?? null,
            projectName: projectName(document.projectId),
            url: `/api/v1/documents/${id}/download`,
            score: 0,
          },
        ];
      }),
      ...knowledgeItems.map((item) => ({
        kind: 'knowledge' as const,
        entityId: item._id.toString(),
        title: item.title,
        content: [`Type: ${item.type}.`, item.content].join(' '),
        projectId: item.projectId?.toString() ?? null,
        projectName: projectName(item.projectId),
        url: null,
        score: 0,
      })),
      ...projects.map((project) => ({
        kind: 'project' as const,
        entityId: project._id.toString(),
        title: project.name,
        content: [
          `Status: ${project.status}.`,
          `Risk level: ${project.riskLevel}.`,
          project.ownerName ? `Owner: ${project.ownerName}.` : '',
          project.dueDate ? `Due date: ${project.dueDate.toISOString().slice(0, 10)}.` : '',
          project.description,
          project.objectives?.length ? `Objectives: ${project.objectives.join('; ')}.` : '',
        ]
          .filter(Boolean)
          .join(' '),
        projectId: project._id.toString(),
        projectName: project.name,
        url: null,
        score: 0,
      })),
    ];

    const ranked = candidates
      .map((source) => ({ ...source, score: relevanceScore(terms, source.title, source.content) }))
      .filter((source) => source.score > 0)
      .sort((a, b) => b.score - a.score);

    // Keep the best chunk per document so one long file cannot crowd out every other source.
    const seen = new Set<string>();
    const sources = ranked
      .filter((source) => {
        const key = `${source.kind}:${source.entityId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_SOURCES)
      .map((source) => ({ ...source, content: source.content.slice(0, MAX_SOURCE_CHARACTERS) }));

    return { terms, candidateCount: candidates.length, sources };
  }

  private async requireProject(organizationId: Types.ObjectId, projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) throw new NotFoundException('Project not found.');
    const project = await this.projectModel
      .findOne({ _id: new Types.ObjectId(projectId), organizationId, deletedAt: null })
      .lean();
    if (!project) throw new NotFoundException('Project not found.');
    return project._id;
  }
}
