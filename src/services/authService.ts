import { hash , verify } from 'argon2';
import { ConflictError , UnauthorizedError } from '../errors.js';
import { createUser , findByEmail} from '../repositories/usersRepository.js';
import { randomUUID } from 'node:crypto';
import { signToken } from '../auth/token.js'

export async function register(email: string, password: string): Promise<{ id: string; email: string }> {
  const hashedPassword = await hash(password);
  const user = await createUser({ id: randomUUID(), email, passwordHash: hashedPassword });
  if (!user) {
    throw new ConflictError('Email already registered');
  }
  
  return { id: user.id, email: user.email };
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  const user = await findByEmail(email);
  const ok = user ? await verify(user.passwordHash, password) : false;
  if (!user || !ok) throw new UnauthorizedError('Invalid email or password');
  return { token: await signToken(user.id) };
}