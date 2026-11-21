import { Body, Controller, Get, Post } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';

type Member = { id: number; name: string };

@Controller('members')
export class MembersController {
  constructor(private readonly db: DatabaseSync) {}

  // POST /members … メンバーを足す
  @Post()
  create(@Body() body: { name: string }): Member {
    const { lastInsertRowid } = this.db
      .prepare('INSERT INTO members (name) VALUES (?)')
      .run(body.name);
    return { id: Number(lastInsertRowid), name: body.name };
  }

  // GET /members … メンバーの一覧
  @Get()
  findAll(): Member[] {
    return this.db
      .prepare('SELECT id, name FROM members ORDER BY id')
      .all() as Member[];
  }
}
