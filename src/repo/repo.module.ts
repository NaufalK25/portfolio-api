import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { GhRepoModule } from 'src/gh-repo/gh-repo.module';

@Module({
  imports: [CloudinaryModule, GhRepoModule],
  controllers: [RepoController],
  providers: [RepoService],
})
export class RepoModule {}
