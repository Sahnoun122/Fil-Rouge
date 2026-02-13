import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as any;
        message = response.message || response.error || exception.message;
        error = response.error || exception.name;
        
        // Si c'est un tableau de messages (validation errors)
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else {
      // Erreur non-HTTP (erreurs de base de données, etc.)
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Erreur interne du serveur';
      error = exception.name || 'InternalServerError';
    }

    const errorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log l'erreur pour debugging (en développement seulement)
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔥 Exception caught:', {
        ...errorResponse,
        stack: exception.stack,
      });
    }

    response.status(statusCode).json(errorResponse);
  }
}