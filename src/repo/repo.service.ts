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
        tag: `${dto.owner}/${dto.name}`,
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

  async getReposByTag(tag: string) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        tag,
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
      message: `Get repo with tag ${tag} successfully!`,
      data: repo,
    };
  }

  async updateRepoByTag(
    tag: string,
    dto: UpdateRepoDto,
    uploadResponse?: CloudinaryResponse,
  ) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        tag,
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
        tag,
      },
      data: {
        ...dto,
        stacks: stacks ? stacks.split(',') : repo.stacks,
        thumbnail: uploadResponse ? uploadResponse.public_id : repo.thumbnail,
      },
    });

    return {
      succuess: true,
      message: `Update repo with tag ${tag} successfully!`,
      data: updatedRepo,
    };
  }

  async deleteRepoByTag(tag: string) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        tag,
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
        tag,
      },
    });

    return {
      succuess: true,
      message: `Delete repo with tag ${tag} successfully!`,
      data: repo,
    };
  }
}
