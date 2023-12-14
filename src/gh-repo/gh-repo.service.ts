import { Injectable } from '@nestjs/common';
import { GHRepo, GHRepoName } from './gh-repo.dto';

@Injectable()
export class GhRepoService {
  async getAllGHRepos() {
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
        } satisfies GHRepo as GHRepo;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    return repos;
  }

  async getAllGHReposName() {
    const repos = await this.getAllGHRepos();

    return repos.map(
      (repo) =>
        ({
          id: repo.id,
          name: repo.name,
        } satisfies GHRepoName as GHRepoName),
    );
  }
}
