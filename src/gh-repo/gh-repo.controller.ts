import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GhRepoService } from './gh-repo.service';

@ApiTags('gh-repo')
@Controller('api/gh-repo')
export class GhRepoController {
  constructor(private ghRepo: GhRepoService) {}

  @ApiOperation({
    summary: 'Get github repo by owner/repoName',
  })
  @ApiOkResponse({
    description: 'Get github repo successfully!',
  })
  @Get(':owner/:repoName')
  getGHRepoByName(
    @Param('owner') owner: string,
    @Param('repoName') repoName: string,
  ) {
    return this.ghRepo.getGHRepoByName(owner, repoName);
  }
}
