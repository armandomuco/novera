import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/novera'),
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6380),
  JWT_ACCESS_SECRET: z.string().min(24).default('development-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(24).default('development-refresh-secret-change-me'),
  AI_PROVIDER: z.literal('mock').default('mock'),
  AI_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
  WEB_APP_URL: z.string().url().default('http://localhost:5173'),
  S3_ENDPOINT: z.string().url().default('http://localhost:9010'),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_BUCKET: z.string().min(3).default('novera-local'),
  S3_ACCESS_KEY: z.string().min(1).default('minio'),
  S3_SECRET_KEY: z.string().min(1).default('minio123'),
  DOCUMENT_MAX_SIZE_MB: z.coerce.number().int().min(1).max(100).default(10),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(config: Record<string, unknown>): Environment {
  return environmentSchema.parse(config);
}
