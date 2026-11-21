import { Module } from '@nestjs/common';
import { MembersController } from './members/members.controller.js';
import { PaymentsController } from './payments/payments.controller.js';
import { SettlementController } from './settlement/settlement.controller.js';

@Module({
  controllers: [MembersController, PaymentsController, SettlementController],
})
export class AppModule {}
