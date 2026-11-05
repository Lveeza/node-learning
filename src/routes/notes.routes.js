import { Router } from 'express';
import { listNotes, addNote, getNote, deleteNote ,updateNote} from '../services/notesService.js';
import { validate } from '../http/middleware/validate.js';
import { createNoteSchema, idParamSchema } from '../schemas/notes.schema.js';
import { listQuerySchema } from '../schemas/notes.schema.js';
import { updateNoteSchema } from '../schemas/notes.schema.js';

const router = Router();
router.get('/', validate(listQuerySchema, 'query'), async (req, res) => {
  res.json(await listNotes(req.valid.query));
});

// router.get('/:id', async (req, res) => {
//   res.json(await getNote(req.params.id));
// });

// router.post('/', async (req, res) => {
//   res.status(201).json(await addNote(req.body?.text));
// });

router.delete('/:id', validate(idParamSchema, 'params'), async (req, res) => {
  await deleteNote(req.valid.params.id);
  res.sendStatus(204);
});

router.post('/', validate(createNoteSchema), async (req, res) => {
  const note = await addNote(req.valid.body.text);
  res.status(201).location(`/notes/${note.id}`).json(note);
});

router.get('/:id', validate(idParamSchema, 'params'), async (req, res) => {
  res.json(await getNote(req.valid.params.id));
});

router.patch('/:id' , validate(idParamSchema, 'params'), validate(updateNoteSchema, 'body'), async(req, res) => {
  res.json(await updateNote(req.valid.params.id, req.valid.body))
});

export default router;
