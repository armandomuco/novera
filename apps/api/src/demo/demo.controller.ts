import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { DemoService } from './demo.service';

class DemoLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

class DemoProfileDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  name!: string;
}

class DemoProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  owner!: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

class DemoKnowledgeDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  type!: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

class DemoDocumentDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  type?: string;
}

@ApiTags('demo')
@Controller({ path: 'demo', version: '1' })
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get('workspace')
  @ApiOkResponse({ description: 'Returns the seeded demo workspace.' })
  getWorkspace() {
    return this.demoService.getWorkspace();
  }

  @Post('login')
  @ApiOkResponse({ description: 'Demo login for seeded accounts.' })
  login(@Body() body: DemoLoginDto) {
    return this.demoService.login(body.email, body.password);
  }

  @Patch('profile')
  @ApiOkResponse({ description: 'Updates demo user profile fields.' })
  updateProfile(@Body() body: DemoProfileDto) {
    return this.demoService.updateProfile(body.email, body.name);
  }

  @Post('projects')
  @ApiOkResponse({ description: 'Creates a demo project.' })
  createProject(@Body() body: DemoProjectDto) {
    return this.demoService.createProject(body);
  }

  @Post('knowledge-items')
  @ApiOkResponse({ description: 'Creates a demo knowledge item.' })
  createKnowledgeItem(@Body() body: DemoKnowledgeDto) {
    return this.demoService.createKnowledgeItem(body);
  }

  @Post('documents')
  @ApiOkResponse({ description: 'Creates demo document metadata.' })
  createDocument(@Body() body: DemoDocumentDto) {
    return this.demoService.createDocument(body);
  }
}
