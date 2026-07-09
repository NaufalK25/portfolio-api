import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GhRepoModule } from '../gh-repo/gh-repo.module';

@Module({
  imports: [CloudinaryModule, GhRepoModule],
  controllers: [RepoController],
  providers: [RepoService],
})
export class RepoModule {}
