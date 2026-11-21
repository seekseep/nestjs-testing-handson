import { Body, Controller, Get, Post } from '@nestjs/common';
import { type Payment, PaymentsRepository } from './payments.repository.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  // POST /payments … 立て替えを記録する
  @Post()
  create(@Body() body: Omit<Payment, 'id'>): Payment {
    return this.paymentsRepository.create(body);
  }

  // GET /payments … 立て替えの一覧
  @Get()
  findAll(): Payment[] {
    return this.paymentsRepository.findAll();
  }
}
