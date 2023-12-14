export type GHRepo = {
  id: number;
  name: string;
  homepage: string;
  html_url: string;
  license: GHRepoLicense | null;
  description: string | null;
  created_at: Date;
};

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
