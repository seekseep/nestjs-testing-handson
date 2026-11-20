import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // public/ のファイル（画面の index.html）を、そのまま配る
  app.useStaticAssets(join(import.meta.dirname, '..', 'public'));
  setupApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
