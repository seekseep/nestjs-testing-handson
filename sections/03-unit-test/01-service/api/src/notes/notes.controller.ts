import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { NotesService } from './notes.service.js';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // POST /notes … ノートを作る。正しいアクセストークンが無ければ 401（AuthMiddleware）
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() body: { text: string }) {
    return this.notesService.create(body.text, req.user.sub);
  }

  // GET /notes … ノートの一覧
  @Get()
  findAll() {
    return this.notesService.findAll();
  }

  // DELETE /notes/:id … ノートを消す。成功したら 204（本文なし）。作った人でなければ 403
  @Delete(':id')
  @HttpCode(204)
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.notesService.remove(id, req.user.sub);
  }
}
