import { hash } from 'argon2';
import { ConflictError } from '../errors.js';
import { createUser } from '../repositories/usersRepository.js';
import { randomUUID } from 'node:crypto';

export async function register(email: string, password: string): Promise<{ id: string; email: string }> {
  const hashedPassword = await hash(password);
  const user = await createUser({ id: randomUUID(), email, passwordHash: hashedPassword });
  if (!user) {
    throw new ConflictError('Email already registered');
  }
  
  return { id: user.id, email: user.email };
}