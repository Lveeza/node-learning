// src/config.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  CORS_ORIGINS: z.string().default('')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  API_RATE_LIMIT: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT: z.coerce.number().int().positive().default(10),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export function parseEnv(source: NodeJS.ProcessEnv) {
  return envSchema.safeParse(source);
}

const parsed = parseEnv(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);  // never print the values
  }
  process.exit(1);
}

export const {
  NODE_ENV, PORT, JWT_SECRET, CORS_ORIGINS, TRUST_PROXY, API_RATE_LIMIT, AUTH_RATE_LIMIT,LOG_LEVEL
} = parsed.data;