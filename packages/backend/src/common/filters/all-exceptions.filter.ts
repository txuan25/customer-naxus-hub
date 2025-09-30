import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';
import { ValidationError } from 'class-validator';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  correlationId: string;
  error: {
    type: string;
    message: string | string[];
    details?: any;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const correlationId = (request as any).correlationId || 'unknown';
    
    let status: number;
    let message: string | string[];
    let type: string;
    let details: any = undefined;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        type = responseObj.error || exception.name;
        details = responseObj.details;
      } else {
        message = exception.message;
        type = exception.name;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      type = 'QueryFailedError';
      details = {
        query: (exception as any).query,
        parameters: (exception as any).parameters,
        databaseError: exception.message,
      };
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
      type = 'EntityNotFoundError';
    } else if (exception instanceof CannotCreateEntityIdMapError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Cannot create entity id map';
      type = 'CannotCreateEntityIdMapError';
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = 'Validation failed';
      type = 'ValidationError';
      details = this.formatValidationErrors([exception]);
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      type = exception.name || 'Error';
      
      // In development, include stack trace
      if (process.env.NODE_ENV === 'development') {
        details = {
          stack: exception.stack,
          originalMessage: exception.message,
        };
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      type = 'UnknownError';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      error: {
        type,
        message,
        details,
      },
    };

    // Log the error
    this.logError(exception, errorResponse, request);

    // Send response
    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(errors: ValidationError[]): any {
    const formatted: any = {};
    
    errors.forEach((error) => {
      const property = error.property;
      formatted[property] = {
        value: error.value,
        constraints: error.constraints,
      };
      
      if (error.children && error.children.length > 0) {
        formatted[property].children = this.formatValidationErrors(error.children);
      }
    });
    
    return formatted;
  }

  private logError(exception: unknown, errorResponse: ErrorResponse, request: Request): void {
    const user = (request as any).user;
    const userId = user?.id || 'anonymous';
    
    const logContext = {
      correlationId: errorResponse.correlationId,
      statusCode: errorResponse.statusCode,
      path: errorResponse.path,
      method: errorResponse.method,
      userId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: errorResponse.timestamp,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${errorResponse.error.type}: ${errorResponse.error.message}`,
        exception instanceof Error ? exception.stack : undefined,
        logContext,
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(
        `${errorResponse.error.type}: ${errorResponse.error.message}`,
        logContext,
      );
    } else {
      this.logger.log(
        `${errorResponse.error.type}: ${errorResponse.error.message}`,
        logContext,
      );
    }
  }
}