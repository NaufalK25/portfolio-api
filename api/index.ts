import 'reflect-metadata';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/bootstrap';

const server = express();
let bootstrapped = false;

async function ensureBootstrapped() {
  if (!bootstrapped) {
    const app = await createApp(new ExpressAdapter(server));
    await app.init();
    bootstrapped = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureBootstrapped();
  server(req, res);
}
