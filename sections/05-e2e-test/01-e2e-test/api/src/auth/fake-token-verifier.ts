import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { extractBearerToken } from './bearer-token.js';
import { TokenVerifier } from './token-verifier.js';
import type { User } from './user.js';

/**
 * テスト用の、決め打ちのトークンと、それが表すユーザー。
 * 本物の Cognito のトークンではなく、ただの文字列。
 */
export const FAKE_TOKENS: Record<string, User> = {
  'alice-token': { sub: 'alice', groups: [] },
  'bob-token': { sub: 'bob', groups: [] },
  'admin-token': { sub: 'admin', groups: ['admin'] },
};

/**
 * テストで TokenVerifier の代わりに使う。Cognito には問い合わせず、
 * FAKE_TOKENS に書いたトークンだけを通す。本番では使わない。
 */
@Injectable()
export class FakeTokenVerifier implements Pick<TokenVerifier, 'verify'> {
  constructor() {
    // 本番で間違って使っていないか、起動のログで気づけるようにする
    new Logger(FakeTokenVerifier.name).warn(
      '決め打ちのトークンで認証しています。テスト専用です',
    );
  }

  verify(authorization: string | undefined): Promise<User> {
    const token = extractBearerToken(authorization);
    const user = FAKE_TOKENS[token];
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return Promise.resolve(user);
  }
}
