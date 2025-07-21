export class SendResponse {
  static success<T = any, A extends Record<string, any> = object>(
    data: T,
    message?: string,
    additional?: A,
  ) {
    return {
      success: true,
      ...(message ? { message } : { message: 'Successful' }),
      data,
      ...(additional || {}),
    };
  }

  static error<T = any, A extends Record<string, any> = object>(
    error: T,
    message?: string,
    additional?: A,
  ) {
    return {
      success: false,
      ...(message ? { message } : { message: 'Error' }),
      error,
      ...(additional || {}),
    };
  }
}
