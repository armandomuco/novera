import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDemoRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  company!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  role!: string;

  @IsIn(['1-10', '11-50', '51-200', '201-500', '500+'])
  companySize!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  useCase?: string;
}
