import { Body, Controller, Get, Post } from '@nestjs/common';
import { openDatabase } from '../database.js';

/** 立て替え。payerId の人が amount 円を払い、participantIds の人で分ける。 */
type Payment = {
  id: number;
  payerId: number;
  amount: number;
  memo: string;
  participantIds: number[];
};

@Controller('payments')
export class PaymentsController {
  private readonly db = openDatabase();

  // POST /payments … 立て替えを記録する
  @Post()
  create(@Body() body: Omit<Payment, 'id'>): Payment {
    const { lastInsertRowid } = this.db
      .prepare('INSERT INTO payments (payerId, amount, memo) VALUES (?, ?, ?)')
      .run(body.payerId, body.amount, body.memo);
    const id = Number(lastInsertRowid);
    const insert = this.db.prepare(
      'INSERT INTO payment_participants (paymentId, memberId) VALUES (?, ?)',
    );
    for (const memberId of body.participantIds) {
      insert.run(id, memberId);
    }
    return { id, ...body };
  }

  // GET /payments … 立て替えの一覧
  @Get()
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
