import {
  append,
  findById,
  remove,
  update,
  findPage,
} from "../repositories/notesRepository.js";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { ValidationError, NotFoundError } from "../errors.js";
import type { Note, ListQuery } from "../types.js";

export const notesEvents = new EventEmitter();

function emitSafely(event: string, payload: Note): void {
  try {
    notesEvents.emit(event, payload);
  } catch (error) {
    console.error(error);
  }
}

export async function addNote(text: unknown): Promise<Note> {
  if (typeof text !== "string" || text.trim() === "") {
    throw new ValidationError("Text must be a non-empty string");
  }

  const note = {
    id: randomUUID(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  const saved = await append(note);
  emitSafely("note:added", saved);
  return saved;
}

export async function listNotes({
  limit,
  offset,
  q,
}: ListQuery): Promise<{
  data: Note[];
  meta: { total: number; limit: number; offset: number };
}> {
  const { items, total } = await findPage({ limit, offset, q });
  return { data: items, meta: { total, limit, offset } };
}

export async function getNote(id: string): Promise<Note> {
  const note = await findById(id);

  if (!note) {
    throw new NotFoundError(`Note with id ${id} not found`);
  }
  return note;
}

export async function deleteNote(id: string): Promise<void> {
  const removed = await remove(id);
  if (!removed) throw new NotFoundError(`Note with id ${id} not found`);
}

export async function updateNote(
  id: string,
  changes: { text?: string },
): Promise<Note> {
  const updated = await update(id, changes);
  if (!updated) throw new NotFoundError(`Note with id ${id} not found`);

  emitSafely("note:updated", updated);

  return updated;
}
