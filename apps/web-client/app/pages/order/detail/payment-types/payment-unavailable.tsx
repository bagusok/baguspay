import { AlertCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";
import { memo, useMemo } from "react";

interface Props {
  paymentName: string;
  status: string;
}

export default memo(function PaymentUnavailable({
  paymentName,
  status,
}: Props) {
  const statusConfig = useMemo(() => {
    switch (status) {
      case "expired":
        return {
          icon: (
            <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ),
          title: "Pembayaran Kedaluwarsa",
          message: `Waktu pembayaran melalui ${paymentName} telah habis`,
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800/30",
          textColor: "text-gray-800 dark:text-gray-300",
        };
      case "failed":
        return {
          icon: (
            <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
          ),
          title: "Pembayaran Gagal",
          message: `Pembayaran melalui ${paymentName} mengalami kegagalan`,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800/30",
          textColor: "text-red-800 dark:text-red-300",
        };
      case "cancelled":
        return {
          icon: (
            <AlertCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          ),
          title: "Pembayaran Dibatalkan",
          message: `Pembayaran melalui ${paymentName} telah dibatalkan`,
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-800/30",
          textColor: "text-orange-800 dark:text-orange-300",
        };
      default:
        return {
          icon: (
            <AlertCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ),
          title: "Pembayaran Tidak Tersedia",
          message: `Pembayaran melalui ${paymentName} tidak dapat dilakukan`,
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800/30",
          textColor: "text-gray-800 dark:text-gray-300",
        };
    }
  }, [status, paymentName]);

  return (
    <div
      className={`p-4 ${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg`}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        {statusConfig.icon}
        <p className={`text-sm ${statusConfig.textColor} font-medium`}>
          {statusConfig.title}
        </p>
      </div>
      <p className={`text-sm ${statusConfig.textColor} text-center`}>
        {statusConfig.message}
      </p>
    </div>
  );
});
