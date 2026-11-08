const PORT = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

export { PORT };

const JWT_SECRET = process.env.JWT_SECRET ?? '';
if (JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

export { JWT_SECRET };