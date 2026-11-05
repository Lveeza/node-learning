import { app } from './app.js';
import { PORT } from './config.js';

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

function shutdown(signal: string): void {
  console.log(`${signal} received. Closing server...`);
  server.close((err) => process.exit(err ? 1 : 0));
  setTimeout(() => process.exit(1), 10_000).unref(); 
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});
