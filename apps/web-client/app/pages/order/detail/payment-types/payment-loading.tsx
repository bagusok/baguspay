import { LoaderIcon } from "lucide-react";
import { memo } from "react";

interface Props {
  paymentName: string;
}

export default memo(function PaymentLoading({ paymentName }: Props) {
  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
      <div className="flex items-center justify-center gap-2 mb-2">
        <LoaderIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
        <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
          Memuat Detail Pembayaran
        </p>
      </div>
      <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
        Menunggu detail pembayaran {paymentName}...
      </p>
    </div>
  );
});
