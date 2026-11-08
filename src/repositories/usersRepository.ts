import { prisma } from '../prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import type { UserRecord } from '../types.js';

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}
export async function createUser(user: UserRecord): Promise<UserRecord | null> {
  try {
    const row = await prisma.user.create({ data: user });
    return { id: row.id, email: row.email, passwordHash: row.passwordHash };
  } catch (err) {
    if (isUniqueViolation(err)) return null;
    throw err;
  }
}

export async function findByEmail(email: string): Promise<UserRecord | null> {
  const row = await prisma.user.findUnique({ where: { email } });
  return row ? { id: row.id, email: row.email, passwordHash: row.passwordHash } : null;
}

