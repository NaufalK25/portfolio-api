import { Injectable, NotFoundException } from '@nestjs/common';
import { GhRepoService } from '../gh-repo/gh-repo.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RepoNameService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private ghRepo: GhRepoService,
  ) {}

  async getAllReposName() {
    const cached = await this.redis.get('repo-name:all');
    if (cached) {
      return {
        success: true,
        message: 'Get all repo name successfully!',
        data: cached,
      };
    }

    const reposName = await this.prisma.repoName.findMany();

    if (reposName.length === 0) {
      throw new NotFoundException({
        success: false,
        message: 'Repo name not found!',
        data: null,
      });
    }

    await this.redis.set('repo-name:all', reposName, { ex: 60 * 60 * 24 });

    return {
      success: true,
      message: 'Get all repo name successfully!',
      data: reposName,
    };
  }

  async syncAllReposName() {
    const ghReposName = await this.ghRepo.getAllGHReposName(true);

    const reposNamePayload = ghReposName.map((repoName) => {
      const { id, name, owner } = repoName;
      const { login, type } = owner;

      return {
        ghId: `${id}`,
        name,
        owner: login,
        type,
      };
    });

    const reposName = await this.prisma.repoName.findMany();

    if (reposName.length > 0) {
      await this.prisma.repoName.deleteMany();
    }

    await this.prisma.repoName.createMany({
      data: reposNamePayload,
    });

    await this.redis.del(
      'repo-name:all',
      ...ghReposName.map(
        (repoName) => `gh-repo:name:${repoName.owner.login}:${repoName.name}`,
      ),
    );

    return {
      success: true,
      message: 'Repo name sync successfully!',
      data: null,
    };
  }
}
