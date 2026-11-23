import { Controller, Get } from '@nestjs/common';
import type { Transfer } from './settle.js';
import { SettlementService } from './settlement.service.js';

@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  // GET /settlement … 清算の結果（誰が誰にいくら払うか）
  @Get()
  settlement(): Transfer[] {
    return this.settlementService.settlement();
  }
}
