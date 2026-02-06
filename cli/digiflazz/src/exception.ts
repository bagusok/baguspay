import type { AxiosError } from 'axios'

export class DigiflazzException extends Error {
  public readonly statusCode?: number
  public readonly data?: unknown
  public readonly originalError?: Error

  constructor(
    message: string,
    options?: {
      statusCode?: number
      data?: unknown
      originalError?: Error
    },
  ) {
    super(message)
    this.name = 'DigiflazzException'
    this.statusCode = options?.statusCode
    this.data = options?.data
    this.originalError = options?.originalError
  }

  static fromAxios(error: AxiosError): DigiflazzException {
    return new DigiflazzException(
      (error.response?.data as any)?.message || error.message || 'Digiflazz request failed',
      {
        statusCode: error.response?.status,
        data: error.response?.data,
        originalError: error,
      },
    )
  }
}
