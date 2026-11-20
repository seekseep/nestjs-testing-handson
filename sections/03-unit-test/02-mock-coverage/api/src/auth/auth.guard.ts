import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { TokenVerifier } from './token-verifier.js';
import type { User } from './user.js';

/** Guard を通ったリクエスト。user にトークンのユーザーが入る。 */
export type AuthenticatedRequest = Request & { user: User };

/**
 * Authorization: Bearer <トークン> を確かめる Guard。
 * 正しいトークンなら request.user にユーザーを入れて通し、そうでなければ 401 を返す。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenVerifier: TokenVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = await this.tokenVerifier.verify(
      request.headers.authorization,
    );
    return true;
  }
}
