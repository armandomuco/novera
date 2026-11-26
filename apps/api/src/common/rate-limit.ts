import { Throttle } from '@nestjs/throttler';

const ONE_MINUTE_MS = 60_000;

/** Applied to every route through the global ThrottlerGuard, counted per client IP. */
export const DEFAULT_RATE_LIMIT = { name: 'default', ttl: ONE_MINUTE_MS, limit: 120 };

/**
 * Stricter limit for unauthenticated endpoints that check credentials, send tokens,
 * or create records, to slow down password guessing and token enumeration.
 */
export const SensitiveRateLimit = () => Throttle({ default: { ttl: ONE_MINUTE_MS, limit: 10 } });

/** Assistant questions run retrieval and, with a hosted provider, a paid model call. */
export const AssistantRateLimit = () => Throttle({ default: { ttl: ONE_MINUTE_MS, limit: 20 } });
