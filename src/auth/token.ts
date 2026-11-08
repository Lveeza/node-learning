import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET } from '../config.js';

const secret = new TextEncoder().encode(JWT_SECRET);

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  if (!payload.sub) throw new Error('Token has no subject');
  return payload.sub;
}