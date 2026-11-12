import { app } from './app.js';
import { PORT } from './config.js';
import { logger } from './logger.js';
import { prisma } from './prisma.js';

const server = app.listen(PORT, () => logger.info({ port: PORT }, 'server listening'));

function shutdown(signal: string): void {
  logger.info({ signal }, 'shutting down');
  setTimeout(() => {
    logger.error('forced shutdown');
    process.exit(1);
  }, 10_000).unref();

  server.close((err) => {
    prisma.$disconnect().finally(() => process.exit(err ? 1 : 0));
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'unhandled rejection');
  process.exit(1);
});