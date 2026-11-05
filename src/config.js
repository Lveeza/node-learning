
import path from 'node:path';

export const NOTES_FILE = process.env.NOTES_FILE ?? path.join(import.meta.dirname, '..', 'data', 'notes.json');
export const DB_FILE =
  process.env.DB_FILE ?? path.join(import.meta.dirname, '..', 'data', 'notes.db');

const PORT = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}
export { PORT };
