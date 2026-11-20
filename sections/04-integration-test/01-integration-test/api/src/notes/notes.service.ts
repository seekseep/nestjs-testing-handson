import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isAdmin, type User } from '../auth/user.js';
import type { CreateNoteDto } from './dto/create-note.dto.js';
import type { UpdateNoteDto } from './dto/update-note.dto.js';
import type { Note } from './entities/note.entity.js';

@Injectable()
export class NotesService {
  // メモはメモリ上に持つ。API を止めると消える。
  private readonly notes: Note[] = [];

  create(createNoteDto: CreateNoteDto, user: User): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      ownerId: user.sub,
      title: createNoteDto.title,
      body: createNoteDto.body,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(note);
    return note;
  }

  /** admin なら全員のメモを、そうでなければ自分のメモだけを返す。 */
  findAll(user: User): Note[] {
    if (isAdmin(user)) return this.notes;
    return this.notes.filter((note) => note.ownerId === user.sub);
  }

  /** 無ければ 404、持ち主でも admin でもなければ 403 にする。 */
  findOne(id: string, user: User): Note {
    const note = this.notes.find((n) => n.id === id);
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    if (note.ownerId !== user.sub && !isAdmin(user)) {
      throw new ForbiddenException(`Note ${id} is not yours`);
    }
    return note;
  }

  update(id: string, updateNoteDto: UpdateNoteDto, user: User): Note {
    const note = this.findOne(id, user);
    if (updateNoteDto.title !== undefined) note.title = updateNoteDto.title;
    if (updateNoteDto.body !== undefined) note.body = updateNoteDto.body;
    note.updatedAt = new Date().toISOString();
    return note;
  }

  remove(id: string, user: User): void {
    const note = this.findOne(id, user);
    this.notes.splice(this.notes.indexOf(note), 1);
  }
}
