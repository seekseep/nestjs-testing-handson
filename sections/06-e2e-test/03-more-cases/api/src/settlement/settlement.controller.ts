import { Controller, Get } from '@nestjs/common';
import { openDatabase } from '../database.js';
import { balances, settle, type PaymentInput, type Transfer } from './settle.js';

@Controller('settlement')
export class SettlementController {
  private readonly db = openDatabase();

  // GET /settlement … 清算の結果（誰が誰にいくら払うか）
  @Get()
  settlement(): Transfer[] {
    const payments = this.db
      .prepare('SELECT id, payerId, amount FROM payments ORDER BY id')
      .all() as { id: number; payerId: number; amount: number }[];
    const participants = this.db.prepare(
      'SELECT memberId FROM payment_participants WHERE paymentId = ? ORDER BY memberId',
    );
    const inputs: PaymentInput[] = payments.map((payment) => ({
      payerId: payment.payerId,
      amount: payment.amount,
      participantIds: (participants.all(payment.id) as { memberId: number }[]).map(
        (row) => row.memberId,
      ),
    }));
    // 計算は、DB も HTTP も使わない関数に任せる
    return settle(balances(inputs));
  }
}
