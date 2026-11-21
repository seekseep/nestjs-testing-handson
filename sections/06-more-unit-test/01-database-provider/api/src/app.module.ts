import { Module } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { openDatabase } from './database.js';
import { MembersController } from './members/members.controller.js';
import { PaymentsController } from './payments/payments.controller.js';
import { SettlementController } from './settlement/settlement.controller.js';

@Module({
  controllers: [MembersController, PaymentsController, SettlementController],
  providers: [
    // DatabaseSync を受け取るクラスに、openDatabase() で開いたデータベースを渡す
    { provide: DatabaseSync, useFactory: () => openDatabase() },
  ],
})
export class AppModule {}
