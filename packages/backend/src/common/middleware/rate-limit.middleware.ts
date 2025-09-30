import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Extend Request type to include rateLimit
interface RateLimitRequest extends Request {
  rateLimit?: {
    limit: number;
    current: number;
    remaining: number;
    resetTime: Date;
  };
}

// Helper to get IP from request
const getIp = (req: Request): string => {
  return req.ip || 
         req.headers['x-forwarded-for'] as string || 
         req.headers['x-real-ip'] as string || 
         req.socket.remoteAddress || 
         '127.0.0.1';
};

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => getIp(req),
  handler: (req: Request, res: Response) => {
    const rateLimitReq = req as RateLimitRequest;
    res.status(429).json({
      statusCode: 429,
      message: 'Too many requests',
      error: 'Too Many Requests',
      retryAfter: rateLimitReq.rateLimit?.resetTime,
    });
  },
});

// Auth endpoints rate limiter (stricter)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => getIp(req),
  skipSuccessfulRequests: false, // Count all requests
  handler: (req: Request, res: Response) => {
    const rateLimitReq = req as RateLimitRequest;
    res.status(429).json({
      statusCode: 429,
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      error: 'Too Many Requests',
      retryAfter: rateLimitReq.rateLimit?.resetTime,
    });
  },
});

// API endpoints rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many API requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    const ip = getIp(req);
    // If authenticated, use user ID + IP combination
    return user?.id ? `user-${user.id}-${ip}` : ip;
  },
  handler: (req: Request, res: Response) => {
    const rateLimitReq = req as RateLimitRequest;
    res.status(429).json({
      statusCode: 429,
      message: 'API rate limit exceeded',
      error: 'Too Many Requests',
      retryAfter: rateLimitReq.rateLimit?.resetTime,
    });
  },
});

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: 'Too many file uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    const ip = getIp(req);
    return user?.id ? `user-${user.id}-${ip}` : ip;
  },
  handler: (req: Request, res: Response) => {
    const rateLimitReq = req as RateLimitRequest;
    res.status(429).json({
      statusCode: 429,
      message: 'Upload rate limit exceeded',
      error: 'Too Many Requests',
      retryAfter: rateLimitReq.rateLimit?.resetTime,
    });
  },
});

// Create a custom rate limiter factory
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req: Request) => getIp(req)),
    handler: (req: Request, res: Response) => {
      const rateLimitReq = req as RateLimitRequest;
      res.status(429).json({
        statusCode: 429,
        message: options.message || 'Rate limit exceeded',
        error: 'Too Many Requests',
        retryAfter: rateLimitReq.rateLimit?.resetTime,
      });
    },
  });
};