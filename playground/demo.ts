// playground/demo.ts
type Note = { id: string; text: string; createdAt: string; updatedAt?: string };

async function findById(id: string): Promise<Note | null> {
  return id === 'a' ? { id, text: 'hi', createdAt: '2026-11-04' } : null;
}

// Bug 1: await bhool gaye
async function getNote(id: string): Promise<Note> {
  const note = await findById(id);
  if (!note) throw new Error('not found');
  return note;
}

// Bug 2: null handle nahi kiya
async function printText(id: string) {
  const note = await findById(id);
   if (!note) {
    console.log("Note not found");
    return;
  }
  console.log(note.text);
}

// Bug 3: spelling ghalat
async function printDate(id: string) {
  const note = await findById(id);
  if (note) console.log(note.createdAt);
}

export { getNote, printText, printDate };