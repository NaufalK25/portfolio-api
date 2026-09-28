import { Injectable } from '@nestjs/common';
import { GHRepo, GHRepoName } from './gh-repo.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class GhRepoService {
  constructor(private redis: RedisService) {}

  private async fetchAllPages<T>(url: string): Promise<T[]> {
    const results: T[] = [];
    let nextUrl: string | null = `${url}?per_page=100`;

    while (nextUrl) {
      const res = await fetch(nextUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
      }

      results.push(...((await res.json()) as T[]));

      // Follow rel="next" from the Link header, stop when there isn't one
      const link = res.headers.get('link');
      const match = link?.match(/<([^>]+)>;\s*rel="next"/);
      nextUrl = match ? match[1] : null;
    }

    return results;
  }

  async getAllGHRepos(bypassCache = false): Promise<GHRepo[]> {
    if (!bypassCache) {
      const cached = await this.redis.get('gh-repo:all');
      if (cached) {
        return cached as GHRepo[];
      }
    }

    const [userRepos, orgRepos] = await Promise.all([
      this.fetchAllPages<GHRepo>(
        'https://api.github.com/users/naufalk25/repos',
      ),
      this.fetchAllPages<GHRepo>(
        'https://api.github.com/orgs/primum-coertus/repos',
      ),
    ]);

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
