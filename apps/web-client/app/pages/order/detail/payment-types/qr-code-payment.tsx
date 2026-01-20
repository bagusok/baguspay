import { memo } from 'react'

interface Props {
  qrCode: string
  paymentName: string
}

export default memo(function QRCodePayment({ qrCode, paymentName }: Props) {
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Scan QR Code untuk melakukan pembayaran
        </p>
        <div className="p-4 bg-white rounded-lg border w-fit mx-auto shadow-sm">
          <img
            src={qrCodeImageUrl}
            alt={`QR Code Pembayaran ${paymentName}`}
            className="w-48 h-48"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Buka aplikasi mobile banking atau e-wallet untuk scan
        </p>
      </div>
    </div>
  )
})
