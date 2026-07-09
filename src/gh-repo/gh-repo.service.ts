import { Injectable } from '@nestjs/common';
import { GHRepo, GHRepoName } from './gh-repo.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class GhRepoService {
  constructor(private redis: RedisService) {}

  async getAllGHRepos(bypassCache = false): Promise<GHRepo[]> {
    if (!bypassCache) {
      const cached = await this.redis.get('gh-repo:all');
      if (cached) {
        return cached as GHRepo[];
      }
    }

    const userResponse = await fetch(
      'https://api.github.com/users/naufalk25/repos',
    );
    const orgResponse = await fetch(
      'https://api.github.com/orgs/primum-coertus/repos',
    );

    const userRepos = (await userResponse.json()) as GHRepo[];
    const orgRepos = (await orgResponse.json()) as GHRepo[];

    const repos = [...userRepos, ...orgRepos]
      .map((repo) => {
        return {
          id: repo.id,
          name: repo.name,
          owner: {
            login: repo.owner.login,
            type: repo.owner.type,
          },
          homepage: repo.homepage,
          html_url: repo.html_url,
          license: repo.license
            ? {
                name: repo.license.name,
                url: repo.license.url,
              }
            : null,
          description: repo.description,
          created_at: repo.created_at,
        } satisfies GHRepo;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    await this.redis.set('gh-repo:all', repos, { ex: 60 * 60 * 24 });

    return repos;
  }

  async getAllGHReposName(bypassCache = false): Promise<GHRepoName[]> {
    if (!bypassCache) {
      const cached = await this.redis.get('gh-repo:name:all');
      if (cached) {
        return cached as GHRepoName[];
      }
    }

    const repos = await this.getAllGHRepos(bypassCache);

    const mappedReposName = repos.map(
      (repo) =>
        ({
          id: repo.id,
          name: repo.name,
          owner: {
            login: repo.owner.login,
            type: repo.owner.type,
          },
        }) satisfies GHRepoName,
    );

    await this.redis.set('gh-repo:name:all', mappedReposName, {
      ex: 60 * 60 * 24,
    });

    return mappedReposName;
  }

  async getGHRepoByName(
    owner: string,
    repoName: string,
    bypassCache = false,
  ): Promise<GHRepo> {
    if (!bypassCache) {
      const cached = await this.redis.get(`gh-repo:name:${owner}:${repoName}`);
      if (cached) {
        return cached as GHRepo;
      }
    }

    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}`,
    );

    const repo = (await repoResponse.json()) as GHRepo;

    const ghRepo = {
      id: repo.id,
      name: repo.name,
      owner: {
        login: repo.owner.login,
        type: repo.owner.type,
      },
      homepage: repo.homepage,
      html_url: repo.html_url,
      license: repo.license
        ? {
            name: repo.license.name,
            url: repo.license.url,
          }
        : null,
      description: repo.description,
      created_at: repo.created_at,
    } satisfies GHRepo;

    await this.redis.set(`gh-repo:name:${owner}:${repoName}`, ghRepo, {
      ex: 60 * 60 * 24,
    });

    return ghRepo;
  }
}
