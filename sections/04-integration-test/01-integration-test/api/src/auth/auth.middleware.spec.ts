import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthMiddleware, type AuthenticatedRequest } from './auth.middleware.js';
import type { TokenVerifier } from './token-verifier.js';

describe('AuthMiddleware', () => {
  // TokenVerifier の verify() の偽物。何を返すかをテストごとに決める
  const verify = vi.fn<TokenVerifier['verify']>();
  const middleware = new AuthMiddleware({ verify } as unknown as TokenVerifier);
  const next = vi.fn();

  beforeEach(() => {
    verify.mockReset();
    next.mockReset();
  });

  /** Authorization ヘッダーだけを持つリクエストを作る。 */
  function requestWith(authorization?: string) {
    return { headers: { authorization } } as AuthenticatedRequest;
  }

  it('正しいトークンなら、ユーザーを req.user に入れて先に進める', async () => {
    verify.mockResolvedValue({ sub: 'alice' });
    const req = requestWith('Bearer good');

    await middleware.use(req, {} as Response, next);

    expect(verify).toHaveBeenCalledWith('Bearer good');
    expect(req.user).toEqual({ sub: 'alice' });
    expect(next).toHaveBeenCalled();
  });

  it('正しくないトークンなら 401 にして、先に進めない', async () => {
    verify.mockRejectedValue(new UnauthorizedException('Invalid token'));

    await expect(
      middleware.use(requestWith('Bearer bad'), {} as Response, next),
    ).rejects.toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });
});
