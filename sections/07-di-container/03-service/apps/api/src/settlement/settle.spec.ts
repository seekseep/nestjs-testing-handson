import { describe, expect, it } from 'vitest';
import { balances, settle, split } from './settle.js';

describe('split', () => {
  // S1
  it('割り切れるときは、同じ額に分ける', () => {
    expect(split(9000, 3)).toEqual([3000, 3000, 3000]);
  });

  // S2
  it('割り切れないときは、前の人から 1 円ずつ足し、合計を元の金額と同じにする', () => {
    const shares = split(10000, 3);

    expect(shares).toEqual([3334, 3333, 3333]);
    expect(shares.reduce((a, b) => a + b)).toBe(10000);
  });

  // S3
  it('0 円は、全員 0 円', () => {
    expect(split(0, 3)).toEqual([0, 0, 0]);
  });

  // S4
  it('1 人なら、その人が全部', () => {
    expect(split(500, 1)).toEqual([500]);
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

  // B2
  it('払った人が対象でなければ、払った額がそのままプラスになる', () => {
    const result = balances([
      { payerId: 1, amount: 6000, participantIds: [2, 3] },
    ]);

    expect(result).toEqual([
      { memberId: 1, amount: 6000 },
      { memberId: 2, amount: -3000 },
      { memberId: 3, amount: -3000 },
    ]);
  });

  // B3
  it('どの立て替えにも出てこない人は、入らない', () => {
    const result = balances([
      { payerId: 1, amount: 1000, participantIds: [1, 2] },
    ]);

    expect(result.map((b) => b.memberId)).toEqual([1, 2]);
  });
});

describe('settle', () => {
  // T1
  it('受け取る人 1 人に、ほかの人が払う', () => {
    const result = settle([
      { memberId: 1, amount: 6000 },
      { memberId: 2, amount: -3000 },
      { memberId: 3, amount: -3000 },
    ]);

    expect(result).toEqual([
      { from: 2, to: 1, amount: 3000 },
      { from: 3, to: 1, amount: 3000 },
    ]);
  });

  // T2
  it('多く払う人から、多く受け取る人へ払い、回数を少なくする', () => {
    const result = settle([
      { memberId: 1, amount: 5000 },
      { memberId: 2, amount: 1000 },
      { memberId: 3, amount: -6000 },
    ]);

    expect(result).toEqual([
      { from: 3, to: 1, amount: 5000 },
      { from: 3, to: 2, amount: 1000 },
    ]);
  });

  // T3
  it('差し引きが 0 の人しかいなければ、払う人はいない', () => {
    expect(settle([{ memberId: 1, amount: 0 }])).toEqual([]);
  });
});
