type ApiBodySchema = Record<string, any>;

export const RepoDtoSchema: ApiBodySchema = {
  type: 'object',
  properties: {
    ghId: { type: 'string' },
    name: { type: 'string' },
    owner: { type: 'string' },
    type: { type: 'string', enum: ['User', 'Organization'] },
    homepage: { type: 'string' },
    htmlUrl: { type: 'string' },
    licenseName: { type: 'string' },
    licenseUrl: { type: 'string' },
    thumbnail: {
      type: 'string',
      format: 'binary',
    },
    description: { type: 'string' },
    created_at: { type: 'string' },
    stacks: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};
