import { Controller, Get, Patch } from '@nestjs/common';
import { RepoNameService } from './repo-name.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('repo-name')
@Controller('api/repo-name')
export class RepoNameController {
  constructor(private repoNameService: RepoNameService) {}

  @ApiOperation({
    summary: 'Get all repo name',
  })
  @ApiOkResponse({
    description: 'Get all repo name successfully!',
  })
  @ApiNotFoundResponse({
    description: 'Repo name not found!',
  })
  @Get()
  getAllReposName() {
    return this.repoNameService.getAllReposName();
  }

  @ApiOperation({
    summary: 'Sync repo name to the newest',
  })
  @ApiOkResponse({
    description: 'Repo name sync successfully!',
  })
  @Patch('/sync')
  syncAllReposName() {
    return this.repoNameService.syncAllReposName();
  }
}
