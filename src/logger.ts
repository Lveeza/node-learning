import { pino, type DestinationStream } from 'pino';
import { LOG_LEVEL, NODE_ENV } from './config.js';

export function createLogger(destination?: DestinationStream, level: string = LOG_LEVEL) {
  return pino(
    {
      level,
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'password', '*.password', '*.passwordHash'],
        censor: '[redacted]',
      },
      ...(destination === undefined && NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty' } }
        : {}),
    },
    destination,
  );
}

export const logger = createLogger();