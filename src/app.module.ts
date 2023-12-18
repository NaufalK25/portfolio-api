import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { GhRepoModule } from './gh-repo/gh-repo.module';
import { PrismaModule } from './prisma/prisma.module';
import { RepoModule } from './repo/repo.module';
import { RepoNameModule } from './repo-name/repo-name.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    GhRepoModule,
    RepoNameModule,
    RepoModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
