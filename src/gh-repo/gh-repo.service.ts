import { Injectable } from '@nestjs/common';
import { GHRepo, GHRepoName } from './gh-repo.dto';
import { RedisService } from '../redis/redis.service';

const GH_USERNAME = 'naufalk25';
const GH_ORGS = ['primum-coertus'];

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};

@Injectable()
export class GhRepoService {
  constructor(private redis: RedisService) {}

  private async fetchAllPages<T>(
    url: string,
    pick: (body: unknown) => T[] = (body) => body as T[],
  ): Promise<T[]> {
    const results: T[] = [];
    const firstUrl = new URL(url);
    firstUrl.searchParams.set('per_page', '100');
    let nextUrl: string | null = firstUrl.toString();

    while (nextUrl) {
      const res = await fetch(nextUrl, { headers: GH_HEADERS });

      if (!res.ok) {
        throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
      }

      results.push(...pick(await res.json()));

      // Follow rel="next" from the Link header, stop when there isn't one
      const link = res.headers.get('link');
      const match = link?.match(/<([^>]+)>;\s*rel="next"/);
      nextUrl = match ? match[1] : null;
    }

    return results;
  }

  // Repos outside my account and orgs where I had a pull request merged
  private async fetchContributedRepos(): Promise<GHRepo[]> {
    const excludedOwners = [GH_USERNAME, ...GH_ORGS]
      .map((owner) => `-user:${owner}`)
      .join(' ');
    const query = `author:${GH_USERNAME} type:pr is:merged ${excludedOwners}`;

    const pullRequests = await this.fetchAllPages<{ repository_url: string }>(
      `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`,
      (body) => (body as { items: { repository_url: string }[] }).items,
    );

    const repoUrls = [...new Set(pullRequests.map((pr) => pr.repository_url))];

    return Promise.all(
      repoUrls.map(async (repoUrl) => {
        const res = await fetch(repoUrl, { headers: GH_HEADERS });

        if (!res.ok) {
          throw new Error(
            `GitHub API error ${res.status}: ${await res.text()}`,
          );
        }

        return (await res.json()) as GHRepo;
      }),
    );
  }

  async getAllGHRepos(bypassCache = false): Promise<GHRepo[]> {
    if (!bypassCache) {
      const cached = await this.redis.get('gh-repo:all');
      if (cached) {
        return cached as GHRepo[];
      }
    }

    const fetchedRepos = (
      await Promise.all([
        this.fetchAllPages<GHRepo>(
          `https://api.github.com/users/${GH_USERNAME}/repos`,
        ),
        ...GH_ORGS.map((org) =>
          this.fetchAllPages<GHRepo>(
            `https://api.github.com/orgs/${org}/repos`,
          ),
        ),
        // Repos the token's user collaborates on or can access as an org member
        this.fetchAllPages<GHRepo>(
          'https://api.github.com/user/repos?affiliation=collaborator,organization_member&visibility=public',
        ),
        this.fetchContributedRepos(),
      ])
    ).flat();

    // The sources overlap, so keep the first occurrence of each repo
    const uniqueRepos = [
      ...new Map(fetchedRepos.map((repo) => [repo.id, repo])).values(),
    ];

    const repos = uniqueRepos
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
