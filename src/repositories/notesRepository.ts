import { prisma } from "../prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import type { Note as NoteRow } from "../generated/prisma/client.js";
import type { Note } from "../types.js";

function toNote(row: NoteRow): Note {
  const note: Note = {
    id: row.id,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
  if (row.updatedAt) note.updatedAt = row.updatedAt.toISOString();
  return note;
}

function isRecordNotFound(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

export async function findById(id: string): Promise<Note | null> {
  const row = await prisma.note.findUnique({ where: { id } });
  return row ? toNote(row) : null;
}

export async function append(note: Note): Promise<Note> {
  const row = await prisma.note.create({
    data: { id: note.id, text: note.text, createdAt: new Date(note.createdAt) },
  });
  return note;
}

export async function remove(id: string): Promise<Note | null> {
  try {
    const row = await prisma.note.delete({ where: { id } });
    return toNote(row);
  } catch (err) {
    if (isRecordNotFound(err)) return null;
    throw err;
  }
}

export async function update(
  id: string,
  changes: { text?: string },
): Promise<Note | null> {
  try {
    const row = await prisma.note.update({
      where: { id },
      data: { text: changes.text, updatedAt: new Date() },
    });
    return toNote(row);
  } catch (err) {
    if (isRecordNotFound(err)) return null;
    throw err;
  }
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
  const where: Prisma.NoteWhereInput = q ? { text: { contains: q } } : {};

  const [rows, total] = await prisma.$transaction([
    prisma.note.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: limit,
      skip: offset,
    }),
    prisma.note.count({ where }),
  ]);

  return { items: rows.map(toNote), total };
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, "\\$&");
}
