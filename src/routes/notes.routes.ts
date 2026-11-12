import { Router } from "express";
import {
  listNotes,
  addNote,
  getNote,
  deleteNote,
  updateNote,
} from "../services/notesService.js";
import { validate } from "../http/middleware/validate.js";
import {
  createNoteSchema,
  idParamSchema,
  listQuerySchema,
  updateNoteSchema,
  type CreateNoteInput,
  type UpdateNoteInput,
  type ListQuery
} from "../schemas/notes.schema.js";
import { requireUserId } from "../http/middleware/authenticate.js"

const router = Router();

router.get("/", validate(listQuerySchema, "query"), async (req, res) => {
  const query = req.valid.query as ListQuery;
  res.json(await listNotes({...query , ownerId: requireUserId(req)}));
});

router.delete("/:id", validate(idParamSchema, "params"), async (req, res) => {
  const { id } = req.valid.params as { id: string }; 
  await deleteNote(id , requireUserId(req));
  res.sendStatus(204);
});

router.post("/", validate(createNoteSchema), async (req, res) => {
  const userId = requireUserId(req);
  const { text } = req.valid.body as CreateNoteInput; 
  const note = await addNote(text , userId);
  res.status(201).location(`/notes/${note.id}`).json(note);
});

router.get("/:id", validate(idParamSchema, "params"), async (req, res) => {
  const { id } = req.valid.params as { id: string }; 
  res.json(await getNote(id , requireUserId(req)));
});

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateNoteSchema, "body"),
  async (req, res) => {
    const { id } = req.valid.params as { id: string };          
    const changes = req.valid.body as UpdateNoteInput;            
    res.json(await updateNote(id, changes , requireUserId(req)));
  },
);

export default router;
