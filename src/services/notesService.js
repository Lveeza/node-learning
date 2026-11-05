import {
  append,
  findAll,
  findById,
  remove,
  update,
  findPage,
} from "../repositories/notesRepository.js";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { ValidationError, NotFoundError } from "../errors.js";

export const notesEvents = new EventEmitter();

export async function addNote(text) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new ValidationError("Text must be a non-empty string");
  }

  const note = {
    id: randomUUID(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  const saved = await append(note);

  try {
    notesEvents.emit("note:added", saved);
  } catch (error) {
    console.error(error);
  }

  return saved;
}

export async function listNotes({ limit, offset, q }) {
  const { items, total } = await findPage({ limit, offset, q });
  return { data: items, meta: { total, limit, offset } };
}

export async function getNote(id) {
  const note = await findById(id);

  if (!note) {
    throw new NotFoundError(`Note with id ${id} not found`);
  }
  return note;
}

export async function deleteNote(id) {
  const removed = await remove(id);
  if (!removed) throw new NotFoundError(`Note with id ${id} not found`);
}

export async function updateNote(id, changes) {
  const updated = await update(id, changes);
  if (!updated) throw new NotFoundError(`Note with id ${id} not found`);

  try {
    notesEvents.emit("note:updated", updated);
  } catch (error) {
    console.error(error);
  }

  return updated;
}
