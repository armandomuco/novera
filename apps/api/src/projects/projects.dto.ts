import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const projectStatuses = [
  'Planning',
  'Active',
  'On track',
  'Review',
  'Delayed',
  'Archived',
] as const;
const riskLevels = ['Low', 'Medium', 'High'] as const;

export class CreateProjectDto {
  @IsOptional()
  @IsMongoId()
  organizationId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsIn(projectStatuses)
  status?: string;

  @IsOptional()
  @IsIn(riskLevels)
  riskLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ownerName?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsIn(projectStatuses)
  status?: string;

  @IsOptional()
  @IsIn(riskLevels)
  riskLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ownerName?: string;

  /** An ISO date, or null to clear the due date. */
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];
}
