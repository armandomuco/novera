import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const ASSISTANT_LANGUAGES = ['en', 'sq', 'it', 'de', 'fr'] as const;

export class AskAssistantDto {
  @ApiProperty({ example: 'Why is Atlas onboarding delayed?' })
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  question!: string;

  @ApiPropertyOptional({ description: 'Limit sources to one project in the active organization.' })
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @ApiPropertyOptional({ enum: ASSISTANT_LANGUAGES, default: 'en' })
  @IsOptional()
  @IsIn(ASSISTANT_LANGUAGES)
  language?: (typeof ASSISTANT_LANGUAGES)[number];
}
