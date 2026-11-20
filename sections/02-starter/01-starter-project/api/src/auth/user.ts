/** サインインしているユーザー。トークンの中身から取り出す。 */
export interface User {
  /** ユーザーの ID（Cognito のトークンの sub） */
  sub: string;
  /** 入っているグループ（Cognito のトークンの cognito:groups） */
  groups: string[];
}

/** 全員のメモを扱えるグループの名前。 */
export const ADMIN_GROUP = 'admin';

/** ユーザーが admin グループに入っているか。 */
export function isAdmin(user: User): boolean {
  return user.groups.includes(ADMIN_GROUP);
}
