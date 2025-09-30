import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use both IP and user ID for tracking if authenticated
    const ip = req.ips?.length ? req.ips[0] : req.ip;
    const userId = req.user?.id;
    
    if (userId) {
      return `${ip}-user-${userId}`;
    }
    
    return ip;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any
  ): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}