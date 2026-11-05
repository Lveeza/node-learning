import { addNote, listNotes, notesEvents } from "../src/services/notesService.js";

notesEvents.on("note:added", (note) => {
  console.log("Note added:", note);
});

await Promise.all([addNote("Lav"), addNote("Bil"), addNote("Haa")]);
console.log(await listNotes());
