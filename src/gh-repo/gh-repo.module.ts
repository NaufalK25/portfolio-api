import { Module } from '@nestjs/common';
import { GhRepoService } from './gh-repo.service';

@Module({
  exports: [GhRepoService],
  providers: [GhRepoService],
})
export class GhRepoModule {}
