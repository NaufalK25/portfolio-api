import { Module } from '@nestjs/common';
import { RepoNameController } from './repo-name.controller';
import { RepoNameService } from './repo-name.service';
import { GhRepoModule } from 'src/gh-repo/gh-repo.module';

@Module({
  imports: [GhRepoModule],
  controllers: [RepoNameController],
  providers: [RepoNameService],
})
export class RepoNameModule {}
