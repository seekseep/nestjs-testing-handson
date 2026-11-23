import { DatabaseSync } from 'node:sqlite';

/** SQLite のデータベース（DB_PATH のファイル）を開き、表が無ければ作る。 */
export function openDatabase(
  path = process.env.DB_PATH ?? 'warikan.db',
): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY,
      payerId INTEGER NOT NULL REFERENCES members (id),
      amount INTEGER NOT NULL,
      memo TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS payment_participants (
      paymentId INTEGER NOT NULL REFERENCES payments (id),
      memberId INTEGER NOT NULL REFERENCES members (id),
      PRIMARY KEY (paymentId, memberId)
    ) STRICT;
  `);
  return db;
}
