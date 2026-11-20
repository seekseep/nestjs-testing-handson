import { UnauthorizedException } from '@nestjs/common';
import { extractBearerToken } from './bearer-token.js';

describe('extractBearerToken', () => {
  it('Bearer の後ろのトークンを返す', () => {
    expect(extractBearerToken('Bearer abc')).toBe('abc');
  });

  it('ヘッダーが無ければ 401', () => {
    expect(() => extractBearerToken(undefined)).toThrow(UnauthorizedException);
  });

  it('Bearer で始まらなければ 401', () => {
    expect(() => extractBearerToken('Basic abc')).toThrow(
      'Missing bearer token',
    );
  });
});
