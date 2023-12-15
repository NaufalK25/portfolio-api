import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

type ApiBodySchema = SchemaObject | ReferenceObject;

export const RepoDtoSchema: ApiBodySchema = {
  type: 'object',
  properties: {
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
