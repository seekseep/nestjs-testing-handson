import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from '../payments/payments.repository.js';
import { balances, settle, type Transfer } from './settle.js';

@Injectable()
export class SettlementService {
  // 立て替えを読むリポジトリは、自分で作らずに受け取る（DI）
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  /** 今ある立て替えから、誰が誰にいくら払うかを出す。 */
  settlement(): Transfer[] {
    return settle(balances(this.paymentsRepository.findAll()));
  }
}
