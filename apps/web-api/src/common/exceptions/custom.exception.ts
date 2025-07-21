import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface HttpErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  errors?: Record<string, string>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Default values
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string> | null = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      // Try to get response body and parse it
      const res = exception.getResponse() as string | HttpErrorResponse;

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        // Extract message field
        if (typeof res.message === 'string') {
          message = res.message;
        } else if (Array.isArray(res.message)) {
          // Usually validation errors come as array of strings
          message = 'Validation Error';
          errors = this.formatValidationErrors(res.message);
        } else {
          message = 'Error';
        }

        // Optional detailed errors field (if exists)
        if (res.errors && typeof res.errors === 'object') {
          errors = { ...errors, ...res.errors };
        }
      }
    } else if (exception instanceof Error) {
      // For unknown Errors, use their message
      message = exception.message;
    }

    const jsonResponse = {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    };

    this.logger.error(exception);

    response.status(statusCode).json(jsonResponse);
  }

  /**
   * Converts an array of error messages to key-value pairs, e.g.
   * ["email must be an email"] => { email: "email must be an email" }
   */
  private formatValidationErrors(messages: string[]): Record<string, string> {
    return messages.reduce(
      (acc, curr) => {
        const [field] = curr.split(' ');
        acc[field] = curr;
        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
