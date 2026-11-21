import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface Note {
  id: string;
  text: string;
  // 作った人（アクセストークンの sub）
  ownerId: string;
}

@Injectable()
export class NotesService {
  // ノートはメモリ上の配列に持つ（API を起動し直すと消える）
  private readonly notes: Note[] = [];

  create(text: string, ownerId: string): Note {
    const note = { id: randomUUID(), text, ownerId };
    this.notes.push(note);
    return note;
  }

  findAll(): Note[] {
    return this.notes;
  }

  remove(id: string, userId: string): void {
    const index = this.notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new NotFoundException();
    }
    // 作った人でなければ 403
    if (this.notes[index].ownerId !== userId) {
      throw new ForbiddenException();
    }
    this.notes.splice(index, 1);
  }
}
