export type GHRepo = {
  id: number;
  name: string;
  owner: GHRepoOwner;
  homepage: string;
  html_url: string;
  license: GHRepoLicense | null;
  description: string | null;
  created_at: Date;
};

type GHRepoOwner = {
  login: string;
  type: GHRepoOwnerType;
};

type GHRepoOwnerType = 'User' | 'Organization';

type GHRepoLicense = {
  name: string;
  url: string;
};

export type GHRepoName = Omit<
  Omit<
    Omit<Omit<Omit<GHRepo, 'homepage'>, 'html_url'>, 'license'>,
    'description'
  >,
  'created_at'
>;
