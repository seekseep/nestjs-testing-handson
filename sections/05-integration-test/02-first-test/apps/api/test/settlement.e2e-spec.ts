import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { rmSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('割り勘の API（結合テスト）', () => {
  let app: INestApplication;
  let dbPath: string;

  beforeEach(async () => {
    // テストごとに、一時フォルダの新しいファイルをデータベースにする
    dbPath = join(tmpdir(), `warikan-test-${Date.now()}.db`);
    process.env.DB_PATH = dbPath;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    rmSync(dbPath, { force: true });
  });

  // I1（まずはメンバーを 1 人足すところだけ）
  it('メンバーが、members の表に入る', async () => {
    await request(app.getHttpServer()).post('/members').send({ name: 'A' }).expect(201);

    // API を通さず、データベースのファイルを直接読んで確かめる
    const db = new DatabaseSync(dbPath);
    expect(db.prepare('SELECT * FROM members').all()).toEqual([{ id: 1, name: 'A' }]);
    db.close();
  });
});
