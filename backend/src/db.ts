import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new DatabaseSync(path.join(dataDir, 'app.db'));

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS "group" (
    group_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name  TEXT    NOT NULL,
    invite_code TEXT    NOT NULL UNIQUE,
    created_by  INTEGER NOT NULL REFERENCES user(user_id),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS group_member (
    group_member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id        INTEGER NOT NULL REFERENCES "group"(group_id),
    user_id         INTEGER NOT NULL REFERENCES user(user_id),
    joined_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(group_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS letter (
    letter_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id    INTEGER NOT NULL REFERENCES "group"(group_id),
    sender_id   INTEGER NOT NULL REFERENCES user(user_id),
    receiver_id INTEGER NOT NULL REFERENCES user(user_id),
    content     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    open_at     TEXT    NOT NULL,
    opened_at   TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'opened'))
  );
`);

export default db;
