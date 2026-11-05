import request from "supertest";
import { randomUUID } from "node:crypto";

let app: typeof import('../src/app.js').app;

let db: typeof import('../src/db.js').db;

beforeAll(async () => {
  process.env.DB_FILE = ":memory:";
  ({ app } = await import("../src/app.js"));
  ({ db } = await import("../src/db.js"));
});

beforeEach(() => {
  db.exec("DELETE FROM notes");
});

test("POST /notes creates a note", async () => {
  const res = await request(app).post("/notes").send({ text: "hello" });

  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ text: "hello" });
  expect(res.body.id).toEqual(expect.any(String));
});

test("GET /notes/:id returns 404 for a missing note", async () => {
  const res = await request(app).get(`/notes/${randomUUID()}`);

  expect(res.status).toBe(404);
});

test("GET /notes returns all notes", async () => {
  await request(app).post("/notes").send({ text: "first" });
  await request(app).post("/notes").send({ text: "second" });

  const res = await request(app).get("/notes");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.meta.total).toBe(2);
});

test("DELETE /notes/:id delete a note", async () => {
  const createRes = await request(app).post("/notes").send({ text: "first" });

  const res = await request(app).delete(`/notes/${createRes.body.id}`);

  expect(res.status).toBe(204);
  expect(res.text).toBe("");

  const getRes = await request(app).get(`/notes/${createRes.body.id}`);
  expect(getRes.status).toBe(404);
});

test("DELETE /notes/:id return 404 for missing note", async () => {
  const res = await request(app).delete(`/notes/${randomUUID()}`);

  expect(res.status).toBe(404);
});

test("POST /notes invalid json", async () => {
  const res = await request(app)
    .post("/notes")
    .set("Content-Type", "application/json")
    .send('{ text: "hello" ');

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: "Invalid JSON" });
});

test("POST /notes empty text", async () => {
  const res = await request(app).post("/notes").send({ text: "" });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details).toEqual([
    { field: "text", message: "Text is required" },
  ]);
});

test("POST /notes keeps all notes when 20 requests run in parallel", async () => {
  const texts = Array.from({ length: 20 }, (_, i) => `note ${i + 1}`);

  const responses = await Promise.all(
    texts.map((text) => request(app).post("/notes").send({ text })),
  );

  expect(responses.map((r) => r.status)).toEqual(Array(20).fill(201));
  expect(new Set(responses.map((r) => r.body.id)).size).toBe(20);

  const list = await request(app).get("/notes").query({ limit: 100 });
  expect(list.body.meta.total).toBe(20);
  expect(list.body.data.map((n: {text: string}) => n.text).sort()).toEqual([...texts].sort());
//   expect(
//   (list.body.data as { text: string }[]).map((n) => n.text).sort()
// ).toEqual([...texts].sort());
});

test("GET /notes/:id returns 400 when id is not a valid UUID", async () => {
  const res = await request(app).get("/notes/not-a-uuid");

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details).toEqual([{ field: "id", message: "Invalid UUID" }]);
});

test("PATCH /notes/:id updates the note text", async () => {
  const createRes = await request(app)
    .post("/notes")
    .send({ text: "original" });

  const updateRes = await request(app)
    .patch(`/notes/${createRes.body.id}`)
    .send({ text: "updated" });

  expect(updateRes.status).toBe(200);
  expect(updateRes.body.text).toBe("updated");
  expect(updateRes.body.createdAt).toBe(createRes.body.createdAt);
  expect(updateRes.body.updatedAt).toEqual(expect.any(String));
});

test("PATCH /notes/:id returns 404 for a missing note", async () => {
  const res = await request(app)
    .patch(`/notes/${randomUUID()}`)
    .send({ text: "updated" });

  expect(res.status).toBe(404);
});

test("PATCH /notes empty text", async () => {
  const createRes = await request(app)
    .post("/notes")
    .send({ text: "original" });

  const updateRes = await request(app)
    .patch(`/notes/${createRes.body.id}`)
    .send({ text: "" });

  expect(updateRes.status).toBe(400);
  expect(updateRes.body.error).toBe("Validation failed");
  expect(updateRes.body.details).toEqual([
    { field: "text", message: "Text is required" },
  ]);
});

test("PATCH /notes/:id returns 400 for an empty body", async () => {
  const createRes = await request(app)
    .post("/notes")
    .send({ text: "original" });

  const res = await request(app).patch(`/notes/${createRes.body.id}`).send({});

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details[0].message).toBe("At least one field is required");
});

test("POST /notes extra feild", async () => {
  const res = await request(app)
    .post("/notes")
    .send({ text: "hello", hack: true });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details).toEqual([
    { field: "body", message: 'Unrecognized key: "hack"' },
  ]);
});

test("POST /notes rejects text longer than 500 characters", async () => {
  const res = await request(app)
    .post("/notes")
    .send({ text: "a".repeat(501) });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details[0].field).toBe("text");
});

test("POST /notes accepts text of exactly 500 characters", async () => {
  const res = await request(app)
    .post("/notes")
    .send({ text: "a".repeat(500) });

  expect(res.status).toBe(201);
  expect(res.body.text).toHaveLength(500);
});

test("GET /notes paginates with limit and offset", async () => {
  for (const text of ["note 1", "note 2", "note 3"]) {
    await request(app).post("/notes").send({ text });
  }

  const res = await request(app).get("/notes").query({ limit: 2, offset: 1 });

  expect(res.status).toBe(200);
  expect(res.body.data).toHaveLength(2);
  expect(res.body.data.map((n: {text: string}) => n.text)).toEqual(["note 2", "note 3"]);
  expect(res.body.meta).toMatchObject({ total: 3, limit: 2, offset: 1 });
});

test("GET /notes?q= filters notes by search text", async () => {
  for (const text of ["apple pie", "banana", "Apple juice"]) {
    await request(app).post("/notes").send({ text });
  }

  const res = await request(app).get("/notes").query({ q: "apple" });

  expect(res.status).toBe(200);
  expect(res.body.data.map((n: {text: string}) => n.text).sort()).toEqual([
    "Apple juice",
    "apple pie",
  ]);
  expect(res.body.meta.total).toBe(2);
});

test("GET /notes?q=% treats % as a literal character", async () => {
  await request(app).post("/notes").send({ text: "100% done" });
  await request(app).post("/notes").send({ text: "plain note" });

  const res = await request(app).get("/notes").query({ q: "%" });

  expect(res.body.data.map((n: { text: string }) => n.text)).toEqual(["100% done"]);
  expect(res.body.meta.total).toBe(1);
});
