import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { inertia }) => inertia.render('errors/not_found', { error }),
    '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    const { request, response, session, inertia } = ctx

    if (this.isDrizzleError(error)) {
      console.error('[DRIZZLE ERROR]', error)

      let status = 500
      let message = 'A database error occurred.'

      if (this.isConstraintViolation(error)) {
        status = 409
        message = 'Cannot delete or update because related data exists.'
      }

      if (!app.inProduction) {
        message = (error as any).message || message
      }

      if (request.accepts(['json'])) {
        return response.status(status).send({
          error: message,
        })
      }

      session.flashErrors({
        error: message,
      })
      inertia.share({
        errors: {
          error: message,
        },
      })

      return response.redirect().back()
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }

  private isDrizzleError(error: any): boolean {
    return (
      error?.name === 'PostgresError' || // node-postgres
      error?.constructor?.name === 'PostgresError' ||
      error?.message?.includes('Failed query') ||
      error?.code // Postgres error codes like 23503, etc
    )
  }

  private isConstraintViolation(error: any): boolean {
    return (
      error?.code === '23503' || // foreign key violation
      error?.code === '23505' || // unique violation
      error?.code === '23502' // not null violation
    )
  }
}
