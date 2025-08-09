import { CreditCardIcon } from "lucide-react";
import { memo } from "react";

interface Props {
  paymentName: string;
  paymentType: string;
}

export default memo(function DefaultPayment({
  paymentName,
  paymentType,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800/30 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCardIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <p className="text-sm text-gray-800 dark:text-gray-300 font-medium">
            {paymentName}
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Metode pembayaran: {paymentName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
          Tipe: {paymentType.replace(/_/g, " ")}
        </p>
      </div>
    </div>
  );
});
