import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { NOTES_FILE as DATA_FILE } from "../config.js";
import { db } from "../db.js";
import type { Note } from "../types.js";

// const DATA_DIR = path.dirname(DATA_FILE);

// let queue = Promise.resolve();

// function enqueue(task) {
//   const result = queue.then(task);
//   queue = result.catch(() => {});
//   return result;
// }

// async function readNotes() {
//   try {
//     return JSON.parse(await readFile(DATA_FILE, "utf8"));
//   } catch (err) {
//     if (err.code === "ENOENT") return [];
//     throw err;
//   }
// }

// async function writeNotes(notes) {
//   await mkdir(DATA_DIR, { recursive: true });
//   const tmpFile = `${DATA_FILE}.tmp`;
//   await writeFile(tmpFile, JSON.stringify(notes, null, 2), "utf8");
//   await rename(tmpFile, DATA_FILE);
// }

// export async function append(note) {
//   return enqueue(async () => {
//     const notes = await readNotes();
//     notes.push(note);
//     await writeNotes(notes);
//     return note;
//   });
// // }

// export async function remove(id) {
//   return enqueue(async () => {
//     const notes = await readNotes();
//     const index = notes.findIndex((n) => n.id === id);
//     if (index === -1) return null;

//     const [removed] = notes.splice(index, 1);
//     await writeNotes(notes);
//     return removed;
//   });
// }

// export async function update(id, changes) {
//   return enqueue(async () => {
//     const notes = await readNotes();
//     const index = notes.findIndex((n) => n.id === id);

//     if (index === -1) return null;

//     const existing = notes[index];

//     notes[index] = {
//       ...existing,
//       ...changes,
//       updatedAt: new Date().toISOString(),
//     };

//     await writeNotes(notes);
//     return notes[index];
//   });
// }

// export async function findAll() {
//   return readNotes();
// }

// export async function findById(id) {
//   const note = await readNotes();
//   return note.find((note) => note.id === id);
// }

type NoteRow = {
  id: string;
  text: string;
  created_at: string;
  updated_at: string | null;
};

function toNote(row: NoteRow): Note {
  const note: Note = { id: row.id, text: row.text, createdAt: row.created_at };
  if (row.updated_at) note.updatedAt = row.updated_at;
  return note;
}

export async function findById(id: string): Promise<Note | null> {
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as
    NoteRow | undefined;
  return row ? toNote(row) : null;
}

export async function append(note: Note): Promise<Note> {
  db.prepare("INSERT INTO notes (id, text, created_at) VALUES (?, ?, ?)").run(
    note.id,
    note.text,
    note.createdAt,
  );
  return note;
}

export async function findAll() {
  const rows = db
    .prepare("SELECT * FROM notes ORDER BY created_at ASC, rowid ASC")
    .all() as NoteRow[];
  return rows.map(toNote);
}

export async function remove(id: string): Promise<Note | null> {
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as
    NoteRow | undefined;
  if (!row) return null;
  const result = db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  return result.changes > 0 ? toNote(row) : null;;
}

export async function update(
  id: string,
  changes: { text?: string },
): Promise<Note | null> {
  const updatedAt = new Date().toISOString();

  const result = db
    .prepare("UPDATE notes SET text = ?, updated_at = ? WHERE id = ?")
    .run(changes.text, updatedAt, id);

  if (result.changes === 0) return null;
  return findById(id);
}

export async function findPage({
  limit,
  offset,
  q,
}: {
  limit: number;
  offset: number;
  q?: string;
}): Promise<{ items: Note[]; total: number }> {
  const where = q ? "WHERE text LIKE ? ESCAPE '\\'" : "";
  const params: string[] = q ? [`%${escapeLike(q)}%`] : [];

  const total = (
    db
      .prepare(`SELECT COUNT(*) AS count FROM notes ${where}`)
      .get(...params) as { count: number }
  ).count;

  const rows = db
    .prepare(
      `SELECT * FROM notes ${where}
       ORDER BY created_at ASC, rowid ASC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset) as NoteRow[];

  return { items: rows.map(toNote), total };
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, "\\$&");
}
