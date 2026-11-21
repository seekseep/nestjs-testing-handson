import { Injectable } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';

export type Member = { id: number; name: string };

/** members の表を読み書きする。 */
@Injectable()
export class MembersRepository {
  constructor(private readonly db: DatabaseSync) {}

  create(name: string): Member {
    const { lastInsertRowid } = this.db
      .prepare('INSERT INTO members (name) VALUES (?)')
      .run(name);
    return { id: Number(lastInsertRowid), name };
  }

  findAll(): Member[] {
    return this.db
      .prepare('SELECT id, name FROM members ORDER BY id')
      .all() as Member[];
  }
}
