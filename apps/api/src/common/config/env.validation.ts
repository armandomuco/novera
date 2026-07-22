import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/novera'),
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6380),
  JWT_ACCESS_SECRET: z.string().min(24).default('development-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(24).default('development-refresh-secret-change-me'),
  AI_PROVIDER: z.string().min(1).default('mock'),
  AI_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(config: Record<string, unknown>): Environment {
  return environmentSchema.parse(config);
}
