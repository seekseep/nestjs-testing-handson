import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { type AuthUser, TokenVerifier } from './token-verifier.js';

/** 認証を通ったリクエスト。user にトークンが表すユーザーが入る。 */
export type AuthenticatedRequest = Request & { user: AuthUser };

/**
 * アクセストークンを確かめる middleware。正しければ req.user にユーザーを入れて先に進め、
 * 正しくなければ 401 にする。トークンの検証は TokenVerifier に任せる。
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenVerifier: TokenVerifier) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    req.user = await this.tokenVerifier.verify(req.headers.authorization);
    next();
  }
}
