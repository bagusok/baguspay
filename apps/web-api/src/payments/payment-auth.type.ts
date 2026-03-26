export enum PaymentAuthType {
  PIN = 'PIN',
  PASSKEY = 'PASSKEY',
}

export type PasskeyAssertion = Record<string, any>
