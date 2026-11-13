import { hash, verify } from 'argon2';
import { randomUUID } from 'node:crypto';
import { ConflictError, UnauthorizedError } from '../errors.js';
import { createUser, findByEmail } from '../repositories/usersRepository.js';
import { signToken } from '../auth/token.js';

const DUMMY_HASH = await hash('dummy-password');

export async function register(email: string, password: string): Promise<{ id: string; email: string }> {
  const passwordHash = await hash(password);
  const user = await createUser({ id: randomUUID(), email, passwordHash });
  if (!user) {
    throw new ConflictError('Email already registered');
  }
  return { id: user.id, email: user.email };
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  const user = await findByEmail(email);
  const ok = await verify(user?.passwordHash ?? DUMMY_HASH, password);
  if (!user || !ok) {
    throw new UnauthorizedError('Invalid credentials');
  }
  return { token: await signToken(user.id) };
}