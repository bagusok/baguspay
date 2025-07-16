import { Exception } from '@adonisjs/core/exceptions'

export default class DrizzleException extends Exception {
  constructor(message: string, status: number, code: string) {
    super(message, { status, code })
  }

  static queryFailed(message = 'Database query failed') {
    return new DrizzleException(message, 500, 'E_DRIZZLE_QUERY_FAILED')
  }

  static constraintViolation(message = 'Database constraint violation') {
    return new DrizzleException(message, 409, 'E_DRIZZLE_CONSTRAINT_VIOLATION')
  }

  static notFound(message = 'Record not found') {
    return new DrizzleException(message, 404, 'E_DRIZZLE_NOT_FOUND')
  }

  static connectionFailed(message = 'Database connection failed') {
    return new DrizzleException(message, 500, 'E_DRIZZLE_CONNECTION_FAILED')
  }
}
