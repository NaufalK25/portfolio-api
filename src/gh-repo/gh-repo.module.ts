import { Module } from '@nestjs/common';
import { GhRepoService } from './gh-repo.service';
import { GhRepoController } from './gh-repo.controller';

@Module({
  exports: [GhRepoService],
  providers: [GhRepoService],
  controllers: [GhRepoController],
})
export class GhRepoModule {}
