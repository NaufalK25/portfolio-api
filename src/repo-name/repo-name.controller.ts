import { Controller, Get, Patch } from '@nestjs/common';
import { RepoNameService } from './repo-name.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('repo-name')
@Controller('api/repo-name')
export class RepoNameController {
  constructor(private repoNameService: RepoNameService) {}

  @ApiOperation({
    summary: 'Get all repo name',
  })
  @Get('')
  getAllReposName() {
    return this.repoNameService.getAllReposName();
  }

  @ApiOperation({
    summary: 'Sync repo name to the newest',
  })
  @Patch('/sync')
  syncAllReposName() {
    return this.repoNameService.syncAllReposName();
  }
}
