import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { AssistantRateLimit } from '../common/rate-limit';
import { AskAssistantDto } from './assistant.dto';
import { AssistantService } from './assistant.service';

@ApiTags('assistant')
@Controller({ path: 'assistant', version: '1' })
@UseGuards(AuthGuard)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  @HttpCode(200)
  @AssistantRateLimit()
  @ApiOkResponse({
    description:
      'Answers a question using only sources in the active organization, with citations and confidence.',
  })
  ask(@CurrentAuth() auth: AuthContext, @Body() body: AskAssistantDto) {
    return this.assistantService.ask(auth, body);
  }
}
