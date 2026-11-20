import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { User } from '../auth/user.js';
import { NotesService } from './notes.service.js';

// テスト用のユーザー
const alice: User = { sub: 'alice', groups: [] };
const bob: User = { sub: 'bob', groups: [] };
const admin: User = { sub: 'admin', groups: ['admin'] };

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('作った人が持ち主になる', () => {
    const note = service.create({ title: '買い物', body: '牛乳' }, alice);
    expect(note).toMatchObject({
      ownerId: 'alice',
      title: '買い物',
      body: '牛乳',
    });
  });

  it('一覧には自分のメモだけが出る', () => {
    service.create({ title: 'alice のメモ', body: '' }, alice);
    service.create({ title: 'bob のメモ', body: '' }, bob);
    expect(service.findAll(alice).map((note) => note.title)).toEqual([
      'alice のメモ',
    ]);
  });

  it('admin の一覧には全員のメモが出る', () => {
    service.create({ title: 'alice のメモ', body: '' }, alice);
    service.create({ title: 'bob のメモ', body: '' }, bob);
    expect(service.findAll(admin)).toHaveLength(2);
  });

  it('タイトルだけ書き換えると、本文はそのまま残る', () => {
    const note = service.create({ title: '買い物', body: '牛乳' }, alice);
    const updated = service.update(note.id, { title: '買い物リスト' }, alice);
    expect(updated).toMatchObject({ title: '買い物リスト', body: '牛乳' });
  });

  it('他の人のメモは読めない・書き換えられない・消せない', () => {
    const note = service.create({ title: 'alice のメモ', body: '' }, alice);
    expect(() => service.findOne(note.id, bob)).toThrow(ForbiddenException);
    expect(() => service.update(note.id, { title: 'x' }, bob)).toThrow(
      ForbiddenException,
    );
    expect(() => service.remove(note.id, bob)).toThrow(ForbiddenException);
  });

  it('admin は他の人のメモも書き換えられる', () => {
    const note = service.create({ title: 'alice のメモ', body: '' }, alice);
    expect(service.update(note.id, { title: '直した' }, admin).title).toBe(
      '直した',
    );
  });

  it('無いメモは 404', () => {
    expect(() => service.findOne('no-such-id', admin)).toThrow(
      NotFoundException,
    );
  });
});
