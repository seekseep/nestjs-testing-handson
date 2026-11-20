import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { FakeTokenVerifier } from '../src/auth/fake-token-verifier.js';
import { TokenVerifier } from '../src/auth/token-verifier.js';

/** 決め打ちのトークンを Authorization ヘッダーにする。 */
function as(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('メモの API（結合テスト）', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      // トークンの検証だけを、決め打ちのトークンを通す偽物に差し替える
      .overrideProvider(TokenVerifier)
      .useClass(FakeTokenVerifier)
      .compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('認証', () => {
    it('トークンが無ければ 401', async () => {
      const res = await request(app.getHttpServer()).get('/notes').expect(401);
      expect(res.body).toMatchObject({ message: 'Missing bearer token' });
    });

    it('知らないトークンは 401', () => {
      return request(app.getHttpServer())
        .get('/notes')
        .set(as('nobody-token'))
        .expect(401);
    });
  });

  describe('メモ', () => {
    it('作ったメモが一覧に出て、消すと 404 になる', async () => {
      const server = app.getHttpServer();

      const created = await request(server)
        .post('/notes')
        .set(as('alice-token'))
        .send({ title: '買い物', body: '牛乳' })
        .expect(201);
      expect(created.body).toMatchObject({
        title: '買い物',
        body: '牛乳',
        ownerId: 'alice',
      });
      const id = (created.body as { id: string }).id;

      const list = await request(server)
        .get('/notes')
        .set(as('alice-token'))
        .expect(200);
      expect(list.body).toHaveLength(1);

      await request(server)
        .delete(`/notes/${id}`)
        .set(as('alice-token'))
        .expect(204);
      await request(server)
        .get(`/notes/${id}`)
        .set(as('alice-token'))
        .expect(404);
    });

    it('タイトルが空なら 400 で、理由が message に入る', async () => {
      const res = await request(app.getHttpServer())
        .post('/notes')
        .set(as('alice-token'))
        .send({ title: '' })
        .expect(400);
      expect(res.body.message).toEqual([expect.stringContaining('title')]);
    });

    it('ID が UUID の形でなければ 400', () => {
      return request(app.getHttpServer())
        .get('/notes/123')
        .set(as('alice-token'))
        .expect(400);
    });
  });

  describe('認可', () => {
    it('他の人のメモは 403 で、一覧にも出ない', async () => {
      const server = app.getHttpServer();
      const created = await request(server)
        .post('/notes')
        .set(as('alice-token'))
        .send({ title: 'alice のメモ' })
        .expect(201);
      const id = (created.body as { id: string }).id;

      await request(server)
        .get(`/notes/${id}`)
        .set(as('bob-token'))
        .expect(403);
      const list = await request(server)
        .get('/notes')
        .set(as('bob-token'))
        .expect(200);
      expect(list.body).toEqual([]);
    });

    it('admin は全員のメモを見られる', async () => {
      const server = app.getHttpServer();
      await request(server)
        .post('/notes')
        .set(as('alice-token'))
        .send({ title: 'alice のメモ' })
        .expect(201);
      await request(server)
        .post('/notes')
        .set(as('bob-token'))
        .send({ title: 'bob のメモ' })
        .expect(201);

      const res = await request(server)
        .get('/notes')
        .set(as('admin-token'))
        .expect(200);
      expect(res.body).toHaveLength(2);
    });
  });
});
