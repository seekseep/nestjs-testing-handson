import { UnauthorizedException } from '@nestjs/common';

/**
 * Authorization ヘッダー（`Bearer <トークン>`）から、トークンを取り出す。
 * ヘッダーが無い・形が違うときは 401 の例外を投げる。
 */
export function extractBearerToken(authorization: string | undefined): string {
  const [type, token] = authorization?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedException('Missing bearer token');
  }
  return token;
}
