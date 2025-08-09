import { CheckCircleIcon } from "lucide-react";
import { memo } from "react";

interface Props {
  paymentName: string;
}

export default memo(function PaymentSuccess({ paymentName }: Props) {
  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
      <div className="flex items-center justify-center gap-2 mb-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        <p className="text-sm text-green-800 dark:text-green-300 font-medium">
          Pembayaran Berhasil
        </p>
      </div>
      <p className="text-sm text-green-800 dark:text-green-300 text-center">
        Pembayaran melalui {paymentName} telah berhasil diproses
      </p>
    </div>
  );
});
