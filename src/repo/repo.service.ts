import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRepoDto, UpdateRepoDto } from './repo.dto';
import { CloudinaryResponse } from '../cloudinary/cloudinary.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { GhRepoService } from '../gh-repo/gh-repo.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RepoService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private cloudinary: CloudinaryService,
    private ghRepo: GhRepoService,
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

    const { stacks, notes } = dto;

    const createdRepo = await this.prisma.repo.create({
      data: {
        ...dto,
        stacks: stacks.split(','),
        notes: notes ? this.parseNotes(notes) : [],
        thumbnail: uploadResponse.secure_url,
      },
    });

    await this.redis.del('repo:all');
    await this.triggerPortfolioRebuild();

    return {
      success: true,
      message: 'Create new repo successfully!',
      data: createdRepo,
    };
  }

  async getAllRepos() {
    const cached = await this.redis.get('repo:all');
    if (cached) {
      return {
        success: true,
        message: 'Get all repo successfully!',
        data: cached,
      };
    }

    const repos = await this.prisma.repo.findMany();

    if (repos.length === 0) {
      throw new NotFoundException({
        success: false,
        message: 'Repo not found!',
        data: null,
      });
    }

    await this.redis.set('repo:all', repos, { ex: 60 * 60 * 24 });

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

    await this.redis.del(
      'repo:all',
      ...repos.map((repo) => `repo:ghId:${repo.ghId}`),
    );
    await this.triggerPortfolioRebuild();

    return {
      success: true,
      message: `Delete all repo successfully!`,
      data: null,
    };
  }

  async getReposByGhId(ghId: string) {
    const cached = await this.redis.get(`repo:ghId:${ghId}`);
    if (cached) {
      return {
        success: true,
        message: `Get repo with ghId ${ghId} successfully!`,
        data: cached,
      };
    }

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

    await this.redis.set(`repo:ghId:${ghId}`, repo, { ex: 60 * 60 * 24 });

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

    const { stacks, notes } = dto;

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
        notes: notes !== undefined ? this.parseNotes(notes) : repo.notes,
        thumbnail: uploadResponse ? uploadResponse.secure_url : repo.thumbnail,
      },
    });

    await this.redis.del('repo:all', `repo:ghId:${ghId}`);
    await this.triggerPortfolioRebuild();

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

    await this.redis.del('repo:all', `repo:ghId:${ghId}`);
    await this.triggerPortfolioRebuild();

    return {
      success: true,
      message: `Delete repo with ghId ${ghId} successfully!`,
      data: repo,
    };
  }

  async syncRepoByRepoName(owner: string, repoName: string) {
    const repo = await this.ghRepo.getGHRepoByName(owner, repoName, true);

    await this.redis.del('gh-repo:all', 'gh-repo:name:all');

    const updatedRepo: UpdateRepoDto = {
      name: repo.name,
      owner: repo.owner.login,
      type: repo.owner.type,
      homepage: repo.homepage,
      htmlUrl: repo.html_url,
      description: repo.description,
    };

    if (repo.license) {
      updatedRepo.licenseName = repo.license.name;
      updatedRepo.licenseUrl = repo.license.url;
    }

    if (repo.description) {
      updatedRepo.description = repo.description;
    }

    await this.updateRepoByGhId(repo.id.toString(), updatedRepo);

    return {
      success: true,
      message: `Repo ${owner}/${repoName} sync successfully!`,
      data: null,
    };
  }

  // Rebuild the prerendered portfolio so its pages and SEO match the new data.
  // Awaited because Vercel can freeze the function once the response is sent.
  private async triggerPortfolioRebuild() {
    const hook = process.env.NETLIFY_BUILD_HOOK;
    if (!hook) return;

    try {
      await fetch(`${hook}?trigger_title=portfolio-api+update`, {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // A failed rebuild must not fail the save
    }
  }

  // Notes come from multipart form data: repeated `notes` fields (array),
  // a JSON-encoded array string, or a single text with one paragraph per line.
  private parseNotes(notes: string | string[]): string[] {
    if (Array.isArray(notes)) {
      return notes.flatMap((note) => this.parseNotes(note));
    }

    const trimmed = notes.trim();

    if (trimmed.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (
          Array.isArray(parsed) &&
          parsed.every((note) => typeof note === 'string')
        ) {
          return parsed.map((note) => note.trim()).filter(Boolean);
        }
      } catch {
        // Not JSON, treat it as plain text below
      }
    }

    return trimmed
      .split(/\r?\n/)
      .map((note) => note.trim())
      .filter(Boolean);
  }
}
