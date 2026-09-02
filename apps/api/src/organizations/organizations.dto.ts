import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const assignableOrganizationRoles = [
  'Administrator',
  'Manager',
  'Member',
  'Viewer',
] as const;

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  aiProvider?: string;
}

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsIn(assignableOrganizationRoles)
  role!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number;
}
