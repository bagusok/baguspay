import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Interface custom tidak lagi diperlukan karena kita akan menangani secara dinamis
// Helper method `formatValidationErrors` juga sudah dihapus

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Tentukan status dan payload respons berdasarkan jenis exception
    let statusCode: number;
    let responseBody: { success: boolean; message: string; errors?: any };

    if (exception instanceof HttpException) {
      // Untuk semua error yang merupakan turunan HttpException (termasuk validation error kita)
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        // Kasus sederhana, misal: new NotFoundException('Halaman tidak ditemukan')
        responseBody = {
          success: false,
          message: exceptionResponse,
        };
      } else {
        // Kasus di mana exception memiliki body objek
        // Ini akan menangkap validation error kita yang sudah terformat: { statusCode, message, errors }
        // Dan juga error NestJS default: { statusCode, message, error }
        const { message, errors } = exceptionResponse as any;
        responseBody = {
          success: false,
          message: message || 'Terjadi kesalahan pada request.',
          ...(errors && { errors }), // Hanya tambahkan properti 'errors' jika ada
        };
      }
    } else {
      // Untuk semua error lain yang tidak terduga (bukan HttpException)
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      };
    }

    // Log semua exception untuk debugging, terlepas dari tipenya.
    // Untuk error server, kita bisa log stack trace-nya.
    if (exception instanceof Error) {
      this.logger.error(
        `Exception: ${exception.message}, Status: ${statusCode}`,
        exception.stack, // Stack trace sangat berguna untuk debugging 500 error
      );
    } else {
      this.logger.error(
        `Unknown Exception Caught, Status: ${statusCode}`,
        exception,
      );
    }

    // Kirim respons JSON yang konsisten
    response.status(statusCode).json(responseBody);
  }
}
