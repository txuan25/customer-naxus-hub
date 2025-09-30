import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  // Global rate limit
  global: {
    ttl: parseInt(process.env.THROTTLE_GLOBAL_TTL || '60', 10), // 60 seconds
    limit: parseInt(process.env.THROTTLE_GLOBAL_LIMIT || '100', 10), // 100 requests per minute
  },

  // Auth endpoints rate limit (stricter)
  auth: {
    ttl: parseInt(process.env.THROTTLE_AUTH_TTL || '60', 10), // 60 seconds
    limit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '5', 10), // 5 requests per minute
  },

  // API endpoints rate limit
  api: {
    ttl: parseInt(process.env.THROTTLE_API_TTL || '60', 10), // 60 seconds
    limit: parseInt(process.env.THROTTLE_API_LIMIT || '60', 10), // 60 requests per minute
  },

  // Webhook endpoints rate limit
  webhook: {
    ttl: parseInt(process.env.THROTTLE_WEBHOOK_TTL || '1', 10), // 1 second
    limit: parseInt(process.env.THROTTLE_WEBHOOK_LIMIT || '10', 10), // 10 requests per second
  },

  // Storage configuration for throttle
  storage: {
    type: process.env.THROTTLE_STORAGE_TYPE || 'memory', // 'memory' or 'redis'
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_THROTTLE_DB || '2', 10),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: 'throttle:',
    },
  },

  // Skip rate limiting for certain IPs (internal services, load balancers)
  skipIps: (process.env.THROTTLE_SKIP_IPS || '').split(',').filter(Boolean),

  // Skip rate limiting for certain user agents (monitoring tools)
  skipUserAgents: (process.env.THROTTLE_SKIP_USER_AGENTS || 'kube-probe,ELB-HealthChecker')
    .split(',')
    .filter(Boolean),
}));