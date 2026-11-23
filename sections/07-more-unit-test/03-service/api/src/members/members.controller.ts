import { Body, Controller, Get, Post } from '@nestjs/common';
import { type Member, MembersRepository } from './members.repository.js';

@Controller('members')
export class MembersController {
  constructor(private readonly membersRepository: MembersRepository) {}

  // POST /members … メンバーを足す
  @Post()
  create(@Body() body: { name: string }): Member {
    return this.membersRepository.create(body.name);
  }

  // GET /members … メンバーの一覧
  @Get()
  findAll(): Member[] {
    return this.membersRepository.findAll();
  }
}
