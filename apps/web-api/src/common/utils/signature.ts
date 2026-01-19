import * as crypto from 'crypto'

export class SignatureUtils {
  public static generateCheckoutToken(data: CheckoutTokenData, secretKey: string): string {
    return crypto
      .createHmac('sha256', secretKey)
      .update(
        `${data.billingType.toUpperCase()}:${JSON.stringify({
          inquiry_id: data.inquiryId,
          product_id: data.productId,
          input_fields: data.inputFields,
          product_price: data.productPrice,
          discount: data.discount,
          total_price: data.totalPrice,
          offers: data.offers,
        })}:${data.timestamp}:${data.userId}`,
      )
      .digest('base64url')
  }

  public static verifyCheckoutToken(
    data: CheckoutTokenData,
    secretKey: string,
    signature: string,
  ): boolean {
    const expectedSignature = this.generateCheckoutToken(data, secretKey)

    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  }
}

type CheckoutTokenData = {
  billingType: string
  timestamp: number
  userId: string
  inquiryId: string
  productId: string
  inputFields: any
  productPrice: number
  discount: number
  totalPrice: number
  offers: any[]
}
