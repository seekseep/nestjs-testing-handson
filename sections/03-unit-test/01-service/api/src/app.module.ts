import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { TokenVerifier } from './auth/token-verifier.js';
import { NotesController } from './notes/notes.controller.js';
import { NotesService } from './notes/notes.service.js';

@Module({
  controllers: [NotesController],
  providers: [NotesService, TokenVerifier],
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
