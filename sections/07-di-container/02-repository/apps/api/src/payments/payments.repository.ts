import { Injectable } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';

/** 立て替え。payerId の人が amount 円を払い、participantIds の人で分ける。 */
export type Payment = {
  id: number;
  payerId: number;
  amount: number;
  memo: string;
  participantIds: number[];
};

/** payments と payment_participants の表を読み書きする。 */
@Injectable()
export class PaymentsRepository {
  constructor(private readonly db: DatabaseSync) {}

  create(input: Omit<Payment, 'id'>): Payment {
    const { lastInsertRowid } = this.db
      .prepare('INSERT INTO payments (payerId, amount, memo) VALUES (?, ?, ?)')
      .run(input.payerId, input.amount, input.memo);
    const id = Number(lastInsertRowid);
    const insert = this.db.prepare(
      'INSERT INTO payment_participants (paymentId, memberId) VALUES (?, ?)',
    );
    for (const memberId of input.participantIds) {
      insert.run(id, memberId);
    }
    return { id, ...input };
  }

  findAll(): Payment[] {
    const payments = this.db
      .prepare('SELECT id, payerId, amount, memo FROM payments ORDER BY id')
      .all() as Omit<Payment, 'participantIds'>[];
    const participants = this.db.prepare(
      'SELECT memberId FROM payment_participants WHERE paymentId = ? ORDER BY memberId',
    );
    return payments.map((payment) => ({
      ...payment,
      participantIds: (participants.all(payment.id) as { memberId: number }[]).map(
        (row) => row.memberId,
      ),
    }));
  }
}
