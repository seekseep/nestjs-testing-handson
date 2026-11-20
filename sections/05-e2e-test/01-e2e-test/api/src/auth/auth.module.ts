import { Module } from '@nestjs/common';
import { FakeTokenVerifier } from './fake-token-verifier.js';
import { TokenVerifier } from './token-verifier.js';

// E2E テストのときだけ、決め打ちのトークンを通す偽物を使う（playwright.config.ts が true にする）
const useFakeAuth = process.env.USE_FAKE_AUTH === 'true';

@Module({
  providers: [
    {
      provide: TokenVerifier,
      useClass: useFakeAuth ? FakeTokenVerifier : TokenVerifier,
    },
  ],
  // AuthGuard を使うモジュール（NotesModule）が受け取れるように公開する
  exports: [TokenVerifier],
})
export class AuthModule {}
