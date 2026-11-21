import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  type AuthUser,
  extractBearerToken,
  TokenVerifier,
} from './token-verifier.js';

/**
 * テスト用の、決め打ちのトークンと、それが表すユーザー。
 * 本物の Cognito のトークンではなく、ただの文字列。
 */
export const FAKE_TOKENS: Record<string, AuthUser> = {
  'alice-token': { sub: 'alice' },
  'bob-token': { sub: 'bob' },
};

/**
 * テストで TokenVerifier の代わりに使う。Cognito には問い合わせず、
 * FAKE_TOKENS に書いたトークンだけを通す。本番では使わない。
 */
@Injectable()
export class FakeTokenVerifier implements Pick<TokenVerifier, 'verify'> {
  verify(authorization: string | undefined): Promise<AuthUser> {
    const token = extractBearerToken(authorization);
    const user = FAKE_TOKENS[token];
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return Promise.resolve(user);
  }
}
