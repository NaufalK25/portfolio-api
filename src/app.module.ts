import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RepoModule } from './repo/repo.module';
import { RepoNameModule } from './repo-name/repo-name.module';
import { GhRepoModule } from './gh-repo/gh-repo.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RepoModule,
    RepoNameModule,
    GhRepoModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
