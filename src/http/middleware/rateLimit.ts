import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '../../errors.js';
import { API_RATE_LIMIT, AUTH_RATE_LIMIT } from '../../config.js';

export function createRateLimiter(options: { windowMs: number; limit: number }) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-8',   // sends RateLimit headers
    legacyHeaders: false,         // no old X-RateLimit-* headers
    handler: (_req, _res, next) => next(new TooManyRequestsError()), 
  });
}

export const apiLimiter = createRateLimiter({ windowMs: 60_000, limit: API_RATE_LIMIT });
export const authLimiter = createRateLimiter({ windowMs: 15 * 60_000, limit: AUTH_RATE_LIMIT });