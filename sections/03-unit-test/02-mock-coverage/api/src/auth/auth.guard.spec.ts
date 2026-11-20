import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { TokenVerifier } from './token-verifier.js';
import type { User } from './user.js';

const alice: User = { sub: 'alice', groups: [] };

/** Guard に渡す ExecutionContext のまね。Guard が使うメソッドだけを用意する。 */
function contextFor(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  // TokenVerifier の代わりに、呼ばれ方を記録する偽物（モック）を使う
  const verify = vi.fn<TokenVerifier['verify']>();
  const guard = new AuthGuard({ verify } as unknown as TokenVerifier);

  beforeEach(() => {
    verify.mockReset();
  });

  it('正しいトークンなら、ユーザーを request.user に入れて通す', async () => {
    verify.mockResolvedValue(alice);
    const request = { headers: { authorization: 'Bearer good' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verify).toHaveBeenCalledWith('Bearer good');
    expect(request).toHaveProperty('user', alice);
  });

  it('トークンが正しくなければ、401 の例外をそのまま投げる', async () => {
    verify.mockRejectedValue(new UnauthorizedException('Invalid token'));
    const request = { headers: { authorization: 'Bearer bad' } };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(request).not.toHaveProperty('user');
  });
});
