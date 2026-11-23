import { Controller, Get } from '@nestjs/common';
import { PaymentsRepository } from '../payments/payments.repository.js';
import { balances, settle, type Transfer } from './settle.js';

@Controller('settlement')
export class SettlementController {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  // GET /settlement … 清算の結果（誰が誰にいくら払うか）
  @Get()
  settlement(): Transfer[] {
    // 計算は、DB も HTTP も使わない関数に任せる
    return settle(balances(this.paymentsRepository.findAll()));
  }
}
