import { describe, expect, it } from 'vitest';
import type { Payment, PaymentsRepository } from '../payments/payments.repository.js';
import { SettlementService } from './settlement.service.js';

/** DB の代わりに、決まった立て替えを返す偽物のリポジトリを作る。 */
function fakeRepository(payments: Payment[]) {
  return { findAll: () => payments } as PaymentsRepository;
}

describe('SettlementService', () => {
  it('リポジトリの立て替えから、清算を出す', () => {
    const service = new SettlementService(
      fakeRepository([
        { id: 1, payerId: 1, amount: 10000, memo: '飲み会', participantIds: [1, 2, 3] },
      ]),
    );

    expect(service.settlement()).toEqual([
      { from: 2, to: 1, amount: 3333 },
      { from: 3, to: 1, amount: 3333 },
    ]);
  });

  it('立て替えが無ければ、清算は空', () => {
    const service = new SettlementService(fakeRepository([]));

    expect(service.settlement()).toEqual([]);
  });

  it('いくつもの立て替えを、まとめて差し引きする', () => {
    const service = new SettlementService(
      fakeRepository([
        { id: 1, payerId: 1, amount: 6000, memo: '昼ごはん', participantIds: [1, 2] },
        { id: 2, payerId: 2, amount: 4000, memo: 'タクシー', participantIds: [1, 2] },
      ]),
    );

    expect(service.settlement()).toEqual([{ from: 2, to: 1, amount: 1000 }]);
  });
});
