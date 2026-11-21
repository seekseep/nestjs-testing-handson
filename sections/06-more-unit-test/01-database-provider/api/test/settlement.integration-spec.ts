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

  /** 3 人のメンバーを足し、1 人目が 10,000 円を 3 人分立て替えた状態にする。 */
  async function seed() {
    for (const name of ['A', 'B', 'C']) {
      await request(app.getHttpServer()).post('/members').send({ name }).expect(201);
    }
    await request(app.getHttpServer())
      .post('/payments')
      .send({ payerId: 1, amount: 10000, memo: '飲み会', participantIds: [1, 2, 3] })
      .expect(201);
  }

  it('メンバーと立て替えが、それぞれの表に入る', async () => {
    await seed();

    // API を通さず、データベースのファイルを直接読んで確かめる
    const db = new DatabaseSync(dbPath);
    expect(db.prepare('SELECT * FROM members').all()).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ]);
    expect(db.prepare('SELECT * FROM payments').all()).toEqual([
      { id: 1, payerId: 1, amount: 10000, memo: '飲み会' },
    ]);
    expect(db.prepare('SELECT * FROM payment_participants').all()).toEqual([
      { paymentId: 1, memberId: 1 },
      { paymentId: 1, memberId: 2 },
      { paymentId: 1, memberId: 3 },
    ]);
    db.close();
  });

  it('GET /settlement は、DB の立て替えから清算を返す', async () => {
    await seed();

    const res = await request(app.getHttpServer()).get('/settlement').expect(200);

    expect(res.body).toEqual([
      { from: 2, to: 1, amount: 3333 },
      { from: 3, to: 1, amount: 3333 },
    ]);
  });

  it('立て替えが無ければ、清算は空', async () => {
    const res = await request(app.getHttpServer()).get('/settlement').expect(200);

    expect(res.body).toEqual([]);
  });
});
