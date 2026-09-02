import { IsEmail, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  organizationName!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

export class AcceptInvitationDto {
  @IsString()
  @MinLength(32)
  token!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class SwitchOrganizationDto {
  @IsMongoId()
  organizationId!: string;
}
