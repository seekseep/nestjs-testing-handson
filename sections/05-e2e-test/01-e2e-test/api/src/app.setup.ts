import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';

/**
 * main.ts と結合テストの両方で使う、アプリの設定。
 * テストでも本番と同じ設定で動かすために、1 か所にまとめる。
 */
export function setupApp(app: INestApplication): void {
  // `schema` を指定した @Body() / @Param() の値を検証する
  app.useGlobalPipes(new StandardSchemaValidationPipe());
}
