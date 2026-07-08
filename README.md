# Portfolio API

REST API powering [my portfolio website](https://naufalkateni.com), built with NestJS and Prisma.

## Features

- Auth (JWT)
- GitHub repos sync (`gh-repo`, `repo`, `repo-name`)
- Cloudinary media uploads
- Swagger docs at `/api/docs`

## Tech Stack

- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/) + PostgreSQL ([Neon](https://neon.tech/))
- [Cloudinary](https://cloudinary.com/)

## Getting Started

### Prerequisites

- Node.js (see `.node-version`)
- A PostgreSQL database (e.g. [Neon](https://neon.tech/))

### Setup

```bash
npm install
cp .env.example .env # then fill in the values
npx prisma migrate deploy
npm run start:dev
```

The API runs on `http://localhost:3000` by default, with docs at `http://localhost:3000/api/docs`.

### Environment Variables

See `.env.example` for the full list (database connection, JWT secret, Cloudinary keys, etc).

## Running with Docker

```bash
docker compose up --build
```

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run start:dev`  | Run in watch mode        |
| `npm run build`      | Build for production     |
| `npm run start:prod` | Run the production build |
| `npm run lint`       | Lint and fix             |
| `npm run format`     | Format with Prettier     |
| `npm run test`       | Run unit tests           |
| `npm run test:e2e`   | Run e2e tests            |
