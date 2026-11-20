import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../auth/user.js';
import { createNoteSchema, type CreateNoteDto } from './dto/create-note.dto.js';
import { updateNoteSchema, type UpdateNoteDto } from './dto/update-note.dto.js';
import type { Note } from './entities/note.entity.js';
import { NotesService } from './notes.service.js';

/** URL の :id。 */
const noteIdSchema = z.uuid();

@Controller('notes')
// このコントローラーのどの API も、正しいトークンが無ければ 401 にする
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Body({ schema: createNoteSchema }) createNoteDto: CreateNoteDto,
    @CurrentUser() user: User,
  ): Note {
    return this.notesService.create(createNoteDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User): Note[] {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', { schema: noteIdSchema }) id: string,
    @CurrentUser() user: User,
  ): Note {
    return this.notesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', { schema: noteIdSchema }) id: string,
    @Body({ schema: updateNoteSchema }) updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: User,
  ): Note {
    return this.notesService.update(id, updateNoteDto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', { schema: noteIdSchema }) id: string,
    @CurrentUser() user: User,
  ): void {
    this.notesService.remove(id, user);
  }
}
