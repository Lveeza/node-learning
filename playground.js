// import { createNoteSchema } from './src/schemas/notes.schema.js';

// const inputs = [
//   { text: '  hi  ' },
//   { text: '' },
//   { text: 123 },
//   {},
//   { text: 'ok', admin: true },
// ];

// for (const input of inputs) {
//   const result = createNoteSchema.safeParse(input);
//   console.log('INPUT:', input);
//   if (result.success) console.log('OK   ->', result.data);
//   else console.log('FAIL ->', result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
//   console.log('---');
// }

import Database from "better-sqlite3";
const db = new Database(":memory:");

db.exec("CREATE TABLE notes (id TEXT, text TEXT)");

db.prepare("INSERT INTO notes (id, text) VALUES (?, ?)").run("1", "hello");
db.prepare("INSERT INTO notes (id, text) VALUES (?, ?)").run("2", "world");

console.log(db.prepare("SELECT * FROM notes").all());
console.log(db.prepare("SELECT * FROM notes WHERE id = ?").get("1"));

console.log(db.prepare("DELETE FROM notes WHERE id = ?").run("1"));
console.log(db.prepare("SELECT * FROM notes").all());
console.log(db.prepare("SELECT COUNT(*) AS count FROM notes").get());
