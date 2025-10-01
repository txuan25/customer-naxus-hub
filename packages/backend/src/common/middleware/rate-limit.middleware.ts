import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();

  use(req: Request, res: Response, next: NextFunction) {
    console.log('===== RATE LIMIT MIDDLEWARE RUNNING =====');
    
    const ip = req.ip || req.connection.remoteAddress || '::1';
    const fullPath = req.originalUrl || req.url;
    const key = `${ip}:${fullPath}`;
    
    console.log(`[RateLimit] ${req.method} ${fullPath} from IP: ${ip}`);
    
    // Different limits for different endpoints
    let limit = 1000; // Default: 1000 requests per minute
    const windowMs = 60 * 1000; // 1 minute
    
    // Stricter limits for auth endpoints
    if (fullPath.includes('/auth')) {
      limit = 20; // 3 requests per minute for auth (easier to test)
      console.log(`[RateLimit] Auth endpoint detected, limit: ${limit}`);
    }
    // More lenient for public endpoints
    else if (fullPath.includes('/public')) {
      limit = 2000; // 2000 requests per minute
    }
    
    const now = Date.now();

    // Clean expired entries
    this.cleanup(now);

    const record = this.requests.get(key);
    console.log(`[RateLimit] Key: ${key}, Record:`, record);
    
    if (!record || now > record.resetTime) {
      // New window
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      res.set('X-RateLimit-Remaining', (limit - 1).toString());
      console.log(`[RateLimit] New window, count: 1`);
    } else if (record.count >= limit) {
      // Rate limited
      console.log(`[RateLimit] BLOCKED! Count: ${record.count}, Limit: ${limit}`);
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      // Increment count
      record.count++;
      res.set('X-RateLimit-Remaining', (limit - record.count).toString());
      console.log(`[RateLimit] Incremented count: ${record.count}`);
    }

    res.set('X-RateLimit-Limit', limit.toString());
    next();
  }

  private cleanup(now: number) {
    for (const [key, record] of this.requests) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}