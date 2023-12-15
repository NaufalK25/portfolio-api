import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRepoDto, UpdateRepoDto } from './repo.dto';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RepoService {
  constructor(private prisma: PrismaService) {}

  async createRepo(dto: CreateRepoDto, uploadResponse: CloudinaryResponse) {
    if (!uploadResponse.public_id) {
      return new BadRequestException({
        success: false,
        message: uploadResponse.message,
        data: null,
      });
    }

    const { stacks } = dto;

    const createdRepo = await this.prisma.repo.create({
      data: {
        ...dto,
        stacks: stacks.split(','),
        thumbnail: uploadResponse.public_id,
      },
    });

    return {
      success: true,
      message: 'Create new repo successfully!',
      data: createdRepo,
    };
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

  async deleteAllRepos() {
    const repos = await this.prisma.repo.findMany();

    if (repos.length === 0) {
      return new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    await this.prisma.repo.deleteMany();

    return {
      succuess: true,
      message: `Delete all repo successfully!`,
      data: null,
    };
  }

  async getReposByName(repoName: string) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        name: repoName,
      },
    });

    if (!repo) {
      return new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    return {
      succuess: true,
      message: `Get repo with name ${repoName} successfully!`,
      data: repo,
    };
  }

  async updateRepoByName(
    repoName: string,
    dto: UpdateRepoDto,
    uploadResponse?: CloudinaryResponse,
  ) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        name: repoName,
      },
    });

    if (!repo) {
      return new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    const { stacks } = dto;

    const updatedRepo = await this.prisma.repo.update({
      where: {
        name: repoName,
      },
      data: {
        ...dto,
        stacks: stacks ? stacks.split(',') : repo.stacks,
        thumbnail: uploadResponse ? uploadResponse.public_id : repo.thumbnail,
      },
    });

    return {
      succuess: true,
      message: `Update repo with name ${repoName} successfully!`,
      data: updatedRepo,
    };
  }

  async deleteRepoByName(repoName: string) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        name: repoName,
      },
    });

    if (!repo) {
      return new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    await this.prisma.repo.delete({
      where: {
        name: repoName,
      },
    });

    return {
      succuess: true,
      message: `Delete repo with name ${repoName} successfully!`,
      data: repo,
    };
  }
}
