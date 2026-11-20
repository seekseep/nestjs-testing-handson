import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

/** トークンが表すユーザー。sub はユーザーの ID。 */
export interface AuthUser {
  sub: string;
}

/**
 * Authorization ヘッダー（`Bearer <トークン>`）から、トークンを取り出す。
 * ヘッダーが無い・形が違うときは 401 にする。
 */
export function extractBearerToken(authorization: string | undefined): string {
  const [type, token] = authorization?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedException('Missing bearer token');
  }
  return token;
}

/** 環境変数に Cognito の ID があれば、トークンを検証する道具を作る。無ければ undefined。 */
function createCognitoVerifier() {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  if (!userPoolId || !clientId) return undefined;
  return CognitoJwtVerifier.create({ userPoolId, tokenUse: 'access', clientId });
}

/**
 * Authorization ヘッダーのトークン（Cognito のアクセストークン）を検証する。
 * Cognito の ID が環境変数に無いときは、どのトークンも 401 にする。
 */
@Injectable()
export class TokenVerifier {
  private readonly verifier = createCognitoVerifier();

  constructor() {
    if (!this.verifier) {
      new Logger(TokenVerifier.name).warn(
        'COGNITO_USER_POOL_ID・COGNITO_CLIENT_ID が無いので、トークンはすべて 401 にします',
      );
    }
  }

  /** 正しいトークンならユーザーを返し、そうでなければ 401 の例外を投げる。 */
  async verify(authorization: string | undefined): Promise<AuthUser> {
    const token = extractBearerToken(authorization);
    if (!this.verifier) {
      throw new UnauthorizedException('Invalid token');
    }
    try {
      // 署名・発行元（ユーザープール）・有効期限・token_use・client_id を確かめる
      const payload = await this.verifier.verify(token);
      return { sub: payload.sub };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
