import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../../errors.js';
import { verifyToken } from '../../auth/token.js';

export const authenticate: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new UnauthorizedError());

  try {
    req.userId = await verifyToken(header.slice('Bearer '.length));
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export function requireUserId(req: { userId?: string }): string {
  if (!req.userId) throw new UnauthorizedError();
  return req.userId;
}