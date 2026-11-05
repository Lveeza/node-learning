import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";

const DATA_DIR = path.join(import.meta.dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "notes.json");
export const notesEvents = new EventEmitter();

let queue = Promise.resolve();

function enqueue(task) {
  const result = queue.then(task);
  queue = result.catch(() => {});
  return result;
}

async function readNotes() {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeNotes(notes) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmpFile = `${DATA_FILE}.tmp`;
  await writeFile(tmpFile, JSON.stringify(notes, null, 2), "utf8");
  await rename(tmpFile, DATA_FILE);
}

export async function addNote(text) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("Text must be a non-empty string");
  }
  const note = await enqueue(async () => {
    const notes = await readNotes();
    const newNote = {
      id: randomUUID(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    notes.push(newNote);
    await writeNotes(notes);
    return newNote;
  });

  try {
    notesEvents.emit("note:added", note);
  } catch (error) {
    console.error(error);
  }
  return note;
}

export async function listNotes() {
  return readNotes();
}
