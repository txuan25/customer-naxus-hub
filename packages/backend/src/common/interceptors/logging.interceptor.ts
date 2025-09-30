import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const now = Date.now();

    // Generate or extract correlation ID
    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    request.correlationId = correlationId;
    response.setHeader('X-Correlation-Id', correlationId);

    const { method, url, body, headers, ip, user } = request;
    const userAgent = headers['user-agent'];
    const userId = user?.id || 'anonymous';

    // Log request
    this.logger.log({
      message: 'Incoming request',
      correlationId,
      method,
      url,
      userId,
      ip,
      userAgent,
      body: this.sanitizeBody(body),
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        const { statusCode } = response;

        // Log successful response
        this.logger.log({
          message: 'Outgoing response',
          correlationId,
          method,
          url,
          statusCode,
          userId,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
        });

        // Log slow requests
        if (responseTime > 3000) {
          this.logger.warn({
            message: 'Slow request detected',
            correlationId,
            method,
            url,
            responseTime: `${responseTime}ms`,
            threshold: '3000ms',
          });
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        
        // Log error response
        this.logger.error({
          message: 'Request failed',
          correlationId,
          method,
          url,
          userId,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
        });

        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
      'creditCard',
      'ssn',
      'refreshToken',
      'apiKey',
    ];

    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}