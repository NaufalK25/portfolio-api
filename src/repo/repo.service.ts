import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRepoDto, UpdateRepoDto } from './repo.dto';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RepoService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async createRepo(dto: CreateRepoDto, uploadResponse: CloudinaryResponse) {
    if (!uploadResponse.public_id) {
      throw new BadRequestException({
        success: false,
        message: uploadResponse.message,
        data: null,
      });
    }

    const repo = await this.prisma.repo.findUnique({
      where: {
        ghId: dto.ghId,
      },
    });

    if (repo) {
      throw new BadRequestException({
        success: false,
        message: 'Repo already exists!',
        data: null,
      });
    }

    const { stacks } = dto;

    const createdRepo = await this.prisma.repo.create({
      data: {
        ...dto,
        stacks: stacks.split(','),
        thumbnail: uploadResponse.secure_url,
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
      throw new NotFoundException({
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
      throw new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    await this.prisma.repo.deleteMany();

    return {
      success: true,
      message: `Delete all repo successfully!`,
      data: null,
    };
  }

  async getReposByGhId(ghId: string) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        ghId,
      },
    });

    if (!repo) {
      throw new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    return {
      success: true,
      message: `Get repo with ghId ${ghId} successfully!`,
      data: repo,
    };
  }

  async updateRepoByGhId(
    ghId: string,
    dto: UpdateRepoDto,
    uploadResponse?: CloudinaryResponse,
  ) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        ghId,
      },
    });

    if (!repo) {
      throw new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    const { stacks } = dto;

    if (uploadResponse) {
      await this.cloudinary.deleteImage(
        repo.thumbnail.split('/').at(-1).split('.').slice(0, -1).join('.'),
      );
    }

    const updatedRepo = await this.prisma.repo.update({
      where: {
        ghId,
      },
      data: {
        ...dto,
        stacks: stacks ? stacks.split(',') : repo.stacks,
        thumbnail: uploadResponse ? uploadResponse.secure_url : repo.thumbnail,
      },
    });

    return {
      success: true,
      message: `Update repo with ghId ${ghId} successfully!`,
      data: updatedRepo,
    };
  }

  async deleteRepoByGhId(ghId: string) {
    const repo = await this.prisma.repo.findUnique({
      where: {
        ghId,
      },
    });

    if (!repo) {
      throw new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    await this.cloudinary.deleteImage(
      repo.thumbnail.split('/').at(-1).split('.').slice(0, -1).join('.'),
    );
    await this.prisma.repo.delete({
      where: {
        ghId,
      },
    });

    return {
      success: true,
      message: `Delete repo with ghId ${ghId} successfully!`,
      data: repo,
    };
  }
}
