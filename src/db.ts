import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DB_FILE } from './config.js';

mkdirSync(path.dirname(DB_FILE), { recursive: true });

export const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id         TEXT PRIMARY KEY,
    text       TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 500),
    created_at TEXT NOT NULL,
    updated_at TEXT
  )
`);