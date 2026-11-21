import { Module } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { openDatabase } from './database.js';
import { MembersController } from './members/members.controller.js';
import { MembersRepository } from './members/members.repository.js';
import { PaymentsController } from './payments/payments.controller.js';
import { PaymentsRepository } from './payments/payments.repository.js';
import { SettlementController } from './settlement/settlement.controller.js';
import { SettlementService } from './settlement/settlement.service.js';

@Module({
  controllers: [MembersController, PaymentsController, SettlementController],
  providers: [
    // DatabaseSync を受け取るクラスに、openDatabase() で開いたデータベースを渡す
    { provide: DatabaseSync, useFactory: () => openDatabase() },
    MembersRepository,
    PaymentsRepository,
    SettlementService,
  ],
})
export class AppModule {}
