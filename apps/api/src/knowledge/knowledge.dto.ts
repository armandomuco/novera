import {
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const knowledgeTypes = [
  'document',
  'note',
  'decision',
  'meeting_summary',
  'link',
  'project_update',
  'customer_information',
  'process',
  'risk',
] as const;

export class CreateKnowledgeItemDto {
  @IsOptional()
  @IsMongoId()
  organizationId?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsIn(knowledgeTypes)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  source?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(12000)
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateKnowledgeItemDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsIn(knowledgeTypes)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  source?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(12000)
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
