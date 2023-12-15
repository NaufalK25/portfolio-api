import { Injectable, NotFoundException } from '@nestjs/common';
import { GhRepoService } from 'src/gh-repo/gh-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RepoNameService {
  constructor(
    private prisma: PrismaService,
    private ghRepoService: GhRepoService,
  ) {}

  async getAllReposName() {
    const reposName = await this.prisma.repoName.findMany();

    if (reposName.length === 0) {
      return new NotFoundException({
        success: false,
        message: 'Repo name not found!',
        data: null,
      });
    }

    return {
      success: true,
      message: 'Get all repo name successfully!',
      data: reposName,
    };
  }

  async syncAllReposName() {
    const ghReposName = await this.ghRepoService.getAllGHReposName();

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

    return {
      success: true,
      message: 'Repo name sync successfully!',
      data: null,
    };
  }
}
