import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 画面（http://localhost:3000）から、この API（http://localhost:3001）を呼べるようにする
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
