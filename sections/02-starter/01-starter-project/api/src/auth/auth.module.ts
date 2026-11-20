import { Module } from '@nestjs/common';
import { TokenVerifier } from './token-verifier.js';

@Module({
  providers: [TokenVerifier],
  // AuthGuard を使うモジュール（NotesModule）が受け取れるように公開する
  exports: [TokenVerifier],
})
export class AuthModule {}
