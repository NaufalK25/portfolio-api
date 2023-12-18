import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RepoNameService } from './repo-name.service';
import { JwtGuard } from 'src/auth/guard';

@ApiTags('repo-name')
@Controller('api/repo-name')
export class RepoNameController {
  constructor(private repoName: RepoNameService) {}

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
    return this.repoName.getAllReposName();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Sync repo name to the newest',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized!',
  })
  @ApiOkResponse({
    description: 'Repo name sync successfully!',
  })
  @Patch('/sync')
  syncAllReposName() {
    return this.repoName.syncAllReposName();
  }
}
