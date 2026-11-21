import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotesService } from './notes.service.js';

describe('NotesService', () => {
  let service: NotesService;

  // テストごとに作り直す。どのテストも、ノートが空の状態から始まる
  beforeEach(() => {
    service = new NotesService();
  });

  it('作ったノートが一覧に出る', () => {
    const note = service.create('牛乳を買う', 'alice');

    expect(note).toMatchObject({ text: '牛乳を買う', ownerId: 'alice' });
    expect(service.findAll()).toEqual([note]);
  });

  it('作った人は削除できる', () => {
    const note = service.create('牛乳を買う', 'alice');

    service.remove(note.id, 'alice');

    expect(service.findAll()).toHaveLength(0);
  });

  it('ほかの人のノートは削除できない（403）', () => {
    const note = service.create('牛乳を買う', 'alice');

    expect(() => service.remove(note.id, 'bob')).toThrow(ForbiddenException);
    expect(service.findAll()).toHaveLength(1);
  });

  it('無いノートは削除できない（404）', () => {
    expect(() => service.remove('no-such-id', 'alice')).toThrow(
      NotFoundException,
    );
  });
});
