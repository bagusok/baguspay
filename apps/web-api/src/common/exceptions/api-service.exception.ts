export class ApiServiceException extends Error {
  public httpCode: number;
  public error: Record<string, any>;

  constructor(
    httpCode: number,
    message: string,
    error: Record<string, any> = {},
  ) {
    super(message);
    this.name = 'ApiServiceException';
    this.httpCode = httpCode;
    this.error = error;
  }
}
