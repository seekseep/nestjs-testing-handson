import { describe, expect, it } from 'vitest';
import { balances, split } from './settle.js';

describe('split', () => {
  // S1
  it('割り切れるときは、同じ額に分ける', () => {
    expect(split(9000, 3)).toEqual([3000, 3000, 3000]);
  });
});

describe('balances', () => {
  // B1
  it('払った人はプラス、対象の人はマイナスになる', () => {
    const result = balances([
      { payerId: 1, amount: 9000, participantIds: [1, 2, 3] },
    ]);

    expect(result).toEqual([
      { memberId: 1, amount: 6000 },
      { memberId: 2, amount: -3000 },
      { memberId: 3, amount: -3000 },
    ]);
  });
});
