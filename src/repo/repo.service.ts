import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RepoService {
  constructor(private prisma: PrismaService) {}

  async createRepo() {
    // TODO: Create Repo
  }

  async getAllRepos() {
    const repos = await this.prisma.repo.findMany();

    if (repos.length === 0) {
      return new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    return {
      success: true,
      message: 'Get all repo successfully!',
      data: repos,
    };
  }

  async getReposByName(repoName: string) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        name: repoName,
      },
    });

    return {
      succuess: true,
      message: `Get repo with name ${repoName} successfully!`,
      data: repo,
    };
  }

  async updateRepoByName() {
    // TODO: Update Repo By Name
  }

  async deleteRepoByName(repoName: string) {
    await this.prisma.repo.delete({
      where: {
        name: repoName,
      },
    });

    return {
      succuess: true,
      message: `Delete repo with name ${repoName} successfully!`,
      data: null,
    };
  }
}
