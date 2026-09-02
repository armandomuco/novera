import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const documentTypes = ['PDF', 'DOCX', 'TXT', 'Markdown'] as const;

export class CreateDocumentDto {
  @IsOptional()
  @IsMongoId()
  organizationId?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsIn(documentTypes)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  summary?: string;
}

export class UploadDocumentDto {
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;
}
