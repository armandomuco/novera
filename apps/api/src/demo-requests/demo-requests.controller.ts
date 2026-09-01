import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateDemoRequestDto } from './demo-requests.dto';
import { DemoRequestsService } from './demo-requests.service';

@ApiTags('demo-requests')
@Controller({ path: 'demo-requests', version: '1' })
export class DemoRequestsController {
  constructor(private readonly demoRequestsService: DemoRequestsService) {}

  @Post()
  @ApiOkResponse({ description: 'Requests a manually reviewed, 5-day demo workspace.' })
  createDemoRequest(@Body() body: CreateDemoRequestDto) {
    return this.demoRequestsService.create(body);
  }
}
