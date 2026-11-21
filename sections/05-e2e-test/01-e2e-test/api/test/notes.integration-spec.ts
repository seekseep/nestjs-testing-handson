import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { FakeTokenVerifier } from '../src/auth/fake-token-verifier.js';
import { TokenVerifier } from '../src/auth/token-verifier.js';

/** 決め打ちのトークンを Authorization ヘッダーにする。 */
function as(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('ノートの API（結合テスト）', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // トークンの検証だけを、決め打ちのトークンを通す偽物に差し替える
      .overrideProvider(TokenVerifier)
      .useClass(FakeTokenVerifier)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  /** alice-token でノートを 1 つ作り、その ID を返す。 */
  async function createNote(text: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .set(as('alice-token'))
      .send({ text })
      .expect(201);
    return (res.body as { id: string }).id;
  }

  it('トークンが無ければ、作成は 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .send({ text: '牛乳を買う' })
      .expect(401);
    expect(res.body).toMatchObject({ message: 'Missing bearer token' });
  });

  it('トークンがあれば、作成は 201 で、作った人が ownerId に入る', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .set(as('alice-token'))
      .send({ text: '牛乳を買う' })
      .expect(201);
    expect(res.body).toMatchObject({ text: '牛乳を買う', ownerId: 'alice' });
  });

  it('一覧は、トークンが無くても見られる', async () => {
    await createNote('牛乳を買う');

    const res = await request(app.getHttpServer()).get('/notes').expect(200);
    expect(res.body).toMatchObject([{ text: '牛乳を買う' }]);
  });

  it('ほかの人のノートは削除できない（403）', async () => {
    const id = await createNote('牛乳を買う');

    await request(app.getHttpServer())
      .delete(`/notes/${id}`)
      .set(as('bob-token'))
      .expect(403);
  });

  it('作った人は削除できて（204）、一覧から消える', async () => {
    const id = await createNote('牛乳を買う');

    await request(app.getHttpServer())
      .delete(`/notes/${id}`)
      .set(as('alice-token'))
      .expect(204);
    const res = await request(app.getHttpServer()).get('/notes').expect(200);
    expect(res.body).toEqual([]);
  });

  it('無いノートの削除は 404', async () => {
    await request(app.getHttpServer())
      .delete('/notes/no-such-id')
      .set(as('alice-token'))
      .expect(404);
  });
});
