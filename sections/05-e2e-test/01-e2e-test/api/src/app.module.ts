import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { FakeTokenVerifier } from './auth/fake-token-verifier.js';
import { TokenVerifier } from './auth/token-verifier.js';
import { NotesController } from './notes/notes.controller.js';
import { NotesService } from './notes/notes.service.js';

// E2E テストのときだけ、決め打ちのトークンを通す偽物を使う（playwright.config.ts が true にする）
const useFakeAuth = process.env.USE_FAKE_AUTH === 'true';

@Module({
  controllers: [NotesController],
  providers: [
    NotesService,
    {
      provide: TokenVerifier,
      useClass: useFakeAuth ? FakeTokenVerifier : TokenVerifier,
    },
  ],
})
export class AppModule implements NestModule {
  // ノートの作成と削除にだけ、AuthMiddleware を掛ける（一覧は誰でも見られる）
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'notes', method: RequestMethod.POST },
        { path: 'notes/:id', method: RequestMethod.DELETE },
      );
  }
}
