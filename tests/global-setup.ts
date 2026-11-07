// tests/global-setup.ts (tests se pehle ek baar chalta hai)
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

export default function setup(): void {
  rmSync('test.db', { force: true });
  rmSync('test.db-journal', { force: true });
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}