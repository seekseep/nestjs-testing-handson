import { isAdmin, type User } from './user.js';

describe('isAdmin', () => {
  it('admin グループに入っていれば true', () => {
    const user: User = { sub: 'a', groups: ['admin'] };
    expect(isAdmin(user)).toBe(true);
  });

  it('ほかのグループだけなら false', () => {
    const user: User = { sub: 'a', groups: ['staff'] };
    expect(isAdmin(user)).toBe(false);
  });

  it('どのグループにも入っていなければ false', () => {
    const user: User = { sub: 'a', groups: [] };
    expect(isAdmin(user)).toBe(false);
  });
});
