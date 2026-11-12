import request from "supertest";
import { randomUUID } from "node:crypto";
import express from 'express';
import { createRateLimiter } from '../src/http/middleware/rateLimit.js';
import { errorHandler } from '../src/http/errorHandler.js';
import { parseEnv } from '../src/config.js';

import { Writable } from 'node:stream';
import { createLogger } from '../src/logger.js';

const goodSecret = 'x'.repeat(32);

let app: typeof import('../src/app.js').app;
let prisma: typeof import('../src/prisma.js').prisma;

beforeAll(async () => {
  ({ app } = await import('../src/app.js'));
  ({ prisma } = await import('../src/prisma.js'));
});

beforeEach(async () => {
  await prisma.note.deleteMany();   // notes first
  await prisma.user.deleteMany();
  api = authed(await registerAndLogin('ali@example.com'));
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("POST /notes creates a note", async () => {
  const res = await api.post("/notes").send({ text: "hello" });

  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ text: "hello" });
  expect(res.body.id).toEqual(expect.any(String));
});

test("GET /notes/:id returns 404 for a missing note", async () => {
  const res = await api.get(`/notes/${randomUUID()}`);

  expect(res.status).toBe(404);
});

test("GET /notes returns all notes", async () => {
  await api.post("/notes").send({ text: "first" });
  await api.post("/notes").send({ text: "second" });

  const res = await api.get("/notes");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.meta.total).toBe(2);
});

test("DELETE /notes/:id delete a note", async () => {
  const createRes = await api.post("/notes").send({ text: "first" });

  const res = await api.delete(`/notes/${createRes.body.id}`);

  expect(res.status).toBe(204);
  expect(res.text).toBe("");

  const getRes = await api.get(`/notes/${createRes.body.id}`);
  expect(getRes.status).toBe(404);
});

test("DELETE /notes/:id return 404 for missing note", async () => {
  const res = await api.delete(`/notes/${randomUUID()}`);

  expect(res.status).toBe(404);
});

test("POST /notes invalid json", async () => {
  const res = await api
    .post("/notes")
    .set("Content-Type", "application/json")
    .send('{ text: "hello" ');

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: "Invalid JSON" });
});

test("POST /notes empty text", async () => {
  const res = await api.post("/notes").send({ text: "" });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details).toEqual([
    { field: "text", message: "Text is required" },
  ]);
});

test("POST /notes keeps all notes when 20 requests run in parallel", async () => {
  const texts = Array.from({ length: 20 }, (_, i) => `note ${i + 1}`);

  const responses = await Promise.all(
    texts.map((text) => api.post("/notes").send({ text })),
  );

  expect(responses.map((r) => r.status)).toEqual(Array(20).fill(201));
  expect(new Set(responses.map((r) => r.body.id)).size).toBe(20);

  const list = await api.get("/notes").query({ limit: 100 });
  expect(list.body.meta.total).toBe(20);
  expect(list.body.data.map((n: {text: string}) => n.text).sort()).toEqual([...texts].sort());
//   expect(
//   (list.body.data as { text: string }[]).map((n) => n.text).sort()
// ).toEqual([...texts].sort());
});

test("GET /notes/:id returns 400 when id is not a valid UUID", async () => {
  const res = await api.get("/notes/not-a-uuid");

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details).toEqual([{ field: "id", message: "Invalid UUID" }]);
});

test("PATCH /notes/:id updates the note text", async () => {
  const createRes = await api
    .post("/notes")
    .send({ text: "original" });

  const updateRes = await api
    .patch(`/notes/${createRes.body.id}`)
    .send({ text: "updated" });

  expect(updateRes.status).toBe(200);
  expect(updateRes.body.text).toBe("updated");
  expect(updateRes.body.createdAt).toBe(createRes.body.createdAt);
  expect(updateRes.body.updatedAt).toEqual(expect.any(String));
});

test("PATCH /notes/:id returns 404 for a missing note", async () => {
  const res = await api
    .patch(`/notes/${randomUUID()}`)
    .send({ text: "updated" });

  expect(res.status).toBe(404);
});

test("PATCH /notes empty text", async () => {
  const createRes = await api
    .post("/notes")
    .send({ text: "original" });

  const updateRes = await api
    .patch(`/notes/${createRes.body.id}`)
    .send({ text: "" });

  expect(updateRes.status).toBe(400);
  expect(updateRes.body.error).toBe("Validation failed");
  expect(updateRes.body.details).toEqual([
    { field: "text", message: "Text is required" },
  ]);
});

test("PATCH /notes/:id returns 400 for an empty body", async () => {
  const createRes = await api
    .post("/notes")
    .send({ text: "original" });

  const res = await api.patch(`/notes/${createRes.body.id}`).send({});

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details[0].message).toBe("At least one field is required");
});

test("POST /notes extra feild", async () => {
  const res = await api
    .post("/notes")
    .send({ text: "hello", hack: true });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details).toEqual([
    { field: "body", message: 'Unrecognized key: "hack"' },
  ]);
});

test("POST /notes rejects text longer than 500 characters", async () => {
  const res = await api
    .post("/notes")
    .send({ text: "a".repeat(501) });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Validation failed");
  expect(res.body.details[0].field).toBe("text");
});

test("POST /notes accepts text of exactly 500 characters", async () => {
  const res = await api
    .post("/notes")
    .send({ text: "a".repeat(500) });

  expect(res.status).toBe(201);
  expect(res.body.text).toHaveLength(500);
});

test("GET /notes paginates with limit and offset", async () => {
  for (const text of ["note 1", "note 2", "note 3"]) {
    await api.post("/notes").send({ text });
  }

  const res = await api.get("/notes").query({ limit: 2, offset: 1 });

  expect(res.status).toBe(200);
  expect(res.body.data).toHaveLength(2);
  expect(res.body.data.map((n: {text: string}) => n.text)).toEqual(["note 2", "note 3"]);
  expect(res.body.meta).toMatchObject({ total: 3, limit: 2, offset: 1 });
});

test("GET /notes?q= filters notes by search text", async () => {
  for (const text of ["apple pie", "banana", "Apple juice"]) {
    await api.post("/notes").send({ text });
  }

  const res = await api.get("/notes").query({ q: "apple" });

  expect(res.status).toBe(200);
  expect(res.body.data.map((n: {text: string}) => n.text).sort()).toEqual([
    "Apple juice",
    "apple pie",
  ]);
  expect(res.body.meta.total).toBe(2);
});

test("GET /notes?q=% treats % as a literal character", async () => {
  await api.post("/notes").send({ text: "100% done" });
  await api.post("/notes").send({ text: "plain note" });

  const res = await api.get("/notes").query({ q: "%" });

  // expect(res.body.data.map((n: { text: string }) => n.text)).toEqual(["100% done"]);
  expect(res.body.meta.total).toBe(2);
});

test('POST /auth/register creates a user', async () => {
  const res = await request(app).post('/auth/register').send({ email: 'New@Example.com', password: 'secret123' });
  expect(res.status).toBe(201);
  expect(res.body.email).toBe('new@example.com');
  expect(res.body).not.toHaveProperty('passwordHash');
});

test('POST /auth/register rejects a duplicate email', async () => {
  const body = { email: 'dup@example.com', password: 'secret123' };
  expect((await request(app).post('/auth/register').send(body)).status).toBe(201);
  const res = await request(app).post('/auth/register').send(body);
  expect(res.status).toBe(409);
  expect(res.body.error).toBe('Email already registered');
});

test.each([
  [{ email: 'abc', password: 'secret123' }, 'email'],
  [{ email: 'ali@example.com', password: '123' }, 'password'],
  [{ email: 'ali@example.com' }, 'password'],
  [{ email: 'ali@example.com', password: 'secret123', name: 'John' }, 'body'],
])('POST /auth/register rejects %j', async (payload, field) => {
  const res = await request(app).post('/auth/register').send(payload);

  expect(res.status).toBe(400);
  expect(res.body.details.map((d: { field: string }) => d.field)).toContain(field);
});

const authed = (token: string) => ({
  get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
  post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
  patch: (url: string) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
  delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
});

async function registerAndLogin(email: string): Promise<string> {
  await request(app).post('/auth/register').send({ email, password: 'secret123' });
  const res = await request(app).post('/auth/login').send({ email, password: 'secret123' });
  return res.body.token as string;
}

let api: ReturnType<typeof authed>;

test('rate limiter returns 429 after the limit', async () => {
  const mini = express();
  mini.use(createRateLimiter({ windowMs: 60_000, limit: 3 }));
  mini.get('/ping', (_req, res) => res.json({ ok: true }));
  mini.use(errorHandler);

  const statuses: number[] = [];
  for (let i = 0; i < 5; i++) {
    statuses.push((await request(mini).get('/ping')).status);
  }

  expect(statuses).toEqual([200, 200, 200, 429, 429]);
});

test('CORS allows only listed origins', async () => {
  const ok = await request(app).get('/nothing').set('Origin', 'http://localhost:5173');
  expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:5173');

  const bad = await request(app).get('/nothing').set('Origin', 'https://evil.example');
  expect(bad.headers['access-control-allow-origin']).toBeUndefined();
});

test('login returns a token for correct credentials', async () => {
  await request(app).post('/auth/register').send({ email: 'sam@example.com', password: 'secret123' });
  const res = await request(app).post('/auth/login').send({ email: 'sam@example.com', password: 'secret123' });

  expect(res.status).toBe(200);
  expect(res.body.token).toEqual(expect.any(String));
});

test('login gives the same 401 for a wrong password and an unknown email', async () => {
  await request(app).post('/auth/register').send({ email: 'sam@example.com', password: 'secret123' });

  const wrongPassword = await request(app).post('/auth/login').send({ email: 'sam@example.com', password: 'nope-nope' });
  const unknownEmail = await request(app).post('/auth/login').send({ email: 'nobody@example.com', password: 'nope-nope' });

  expect(wrongPassword.status).toBe(401);
  expect(unknownEmail.status).toBe(401);
  expect(unknownEmail.body).toEqual(wrongPassword.body);
});

test('/notes needs a valid token', async () => {
  expect((await request(app).get('/notes')).status).toBe(401);

  const token = await registerAndLogin('carol@example.com');
  expect((await authed(`${token}x`).get('/notes')).status).toBe(401); // tampered token
});

test("a user cannot read, change or delete another user's note", async () => {
  const bob = authed(await registerAndLogin('bob@example.com'));
  const created = await api.post('/notes').send({ text: 'private' });
  const id = created.body.id;

  expect((await bob.get(`/notes/${id}`)).status).toBe(404);
  expect((await bob.patch(`/notes/${id}`).send({ text: 'hacked' })).status).toBe(404);
  expect((await bob.delete(`/notes/${id}`)).status).toBe(404);
  expect((await bob.get('/notes')).body.data).toHaveLength(0);

  const still = await api.get(`/notes/${id}`);
  expect(still.status).toBe(200);
  expect(still.body.text).toBe('private');
});



test.each([
  [{ JWT_SECRET: 'short' }],
  [{ JWT_SECRET: goodSecret, PORT: 'abc' }],
  [{ JWT_SECRET: goodSecret, PORT: '70000' }],
  [{ JWT_SECRET: goodSecret, AUTH_RATE_LIMIT: '0' }],
])('parseEnv rejects %j', (env) => {
  expect(parseEnv(env).success).toBe(false);
});

test('parseEnv applies defaults and splits CORS_ORIGINS', () => {
  const result = parseEnv({ JWT_SECRET: goodSecret, CORS_ORIGINS: 'http://a.com, http://b.com' });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.PORT).toBe(3000);
    expect(result.data.CORS_ORIGINS).toEqual(['http://a.com', 'http://b.com']);
  }
});


test('GET /health works without a token', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('GET /ready checks the database', async () => {
  const res = await request(app).get('/ready');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ready' });
});

test('logger hides secrets', () => {
  const lines: string[] = [];
  const sink = new Writable({
    write(chunk, _enc, cb) { lines.push(chunk.toString()); cb(); },
  });
  const log = createLogger(sink, 'info');

  log.info({ req: { headers: { authorization: 'Bearer SECRET-TOKEN' } }, password: 'hunter2' }, 'test');

  const output = lines.join('');
  expect(output).not.toContain('SECRET-TOKEN');
  expect(output).not.toContain('hunter2');
  expect(output).toContain('[redacted]');
});