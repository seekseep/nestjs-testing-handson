import { Module } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { openDatabase } from './database.js';

@Module({
  providers: [
    // DatabaseSync を受け取るクラスに、openDatabase() で開いたデータベースを渡す
    { provide: DatabaseSync, useFactory: openDatabase },
  ],
  exports: [DatabaseSync],
})
export class DatabaseModule {}
