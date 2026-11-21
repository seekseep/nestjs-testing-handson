import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MembersController } from './members/members.controller.js';
import { PaymentsController } from './payments/payments.controller.js';
import { SettlementController } from './settlement/settlement.controller.js';

@Module({
  imports: [],
  controllers: [
    AppController,
    MembersController,
    PaymentsController,
    SettlementController,
  ],
  providers: [AppService],
})
export class AppModule {}
