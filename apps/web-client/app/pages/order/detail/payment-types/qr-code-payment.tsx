import { memo } from "react";

interface Props {
  qrCode: string;
  paymentName: string;
}

export default memo(function QRCodePayment({ qrCode, paymentName }: Props) {
  if (!qrCode || qrCode === "SANDBOX MODE") {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
          QR Code belum tersedia
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Scan QR Code untuk melakukan pembayaran
        </p>
        <div className="p-4 bg-white rounded-lg border w-fit mx-auto shadow-sm">
          <img
            src={qrCode}
            alt={`QR Code Pembayaran ${paymentName}`}
            className="w-48 h-48"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Buka aplikasi mobile banking atau e-wallet untuk scan
        </p>
      </div>
    </div>
  );
});
