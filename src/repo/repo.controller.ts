import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RepoService } from './repo.service';

@ApiTags('repo')
@Controller('api/repo')
export class RepoController {
  constructor(private repoService: RepoService) {}

  @ApiOperation({
    summary: 'Create new repo',
  })
  @Post()
  createRepos() {
    // TODO: create repos controller
  }

  @ApiOperation({
    summary: 'Get all repo',
  })
  @Get()
  getAllRepos() {
    return this.repoService.getAllRepos();
  }

  @ApiOperation({
    summary: 'Get repo by name',
  })
  @Get(':name')
  getReposByName(@Param('name') repoName: string) {
    return this.repoService.getReposByName(repoName);
  }

  @ApiOperation({
    summary: 'Update repo by name',
  })
  @Patch(':name')
  updateReposByName() {
    // TODO: update repo by name controller
  }

  @ApiOperation({
    summary: 'Delete repo by name',
  })
  @Delete(':name')
  deleteReposByName(@Param('name') repoName: string) {
    return this.repoService.deleteRepoByName(repoName);
  }
}
