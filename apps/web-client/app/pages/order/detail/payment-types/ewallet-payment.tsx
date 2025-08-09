import { SmartphoneIcon } from "lucide-react";
import { memo } from "react";

interface Props {
  paymentName: string;
}

export default memo(function EWalletPayment({ paymentName }: Props) {
  return (
    <div className="space-y-3">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SmartphoneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
            Buka Aplikasi {paymentName}
          </p>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
          Silakan buka aplikasi {paymentName} untuk melakukan pembayaran
        </p>
      </div>
      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border-l-4 border-blue-300">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          📱 <strong>Langkah:</strong> Buka aplikasi → Pilih Bayar → Scan QR
          atau masukkan kode
        </p>
      </div>
    </div>
  );
});
