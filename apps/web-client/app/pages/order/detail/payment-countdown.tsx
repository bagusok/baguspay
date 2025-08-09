import { Badge } from "@repo/ui/components/ui/badge";
import {
  AlertCircleIcon,
  CalendarIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  expiredAt: string | Date;
  paymentStatus: string;
};

export default function PaymentCountdown({ expiredAt, paymentStatus }: Props) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  // Format countdown timer
  const formatTimeRemaining = (expiredAt: string | Date) => {
    const now = new Date().getTime();
    const expiry = new Date(expiredAt).getTime();
    const difference = expiry - now;

    if (difference <= 0) {
      setIsExpired(true);
      return "Kedaluwarsa";
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}j ${minutes}m ${seconds}d`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}d`;
    } else {
      return `${seconds}d`;
    }
  };

  // Update countdown every second
  useEffect(() => {
    // Don't run countdown for non-pending/expired/failed statuses
    if (!["pending", "expired", "failed"].includes(paymentStatus)) return;

    // If payment status is already expired or failed, set appropriate state
    if (paymentStatus === "expired") {
      setIsExpired(true);
      setTimeRemaining("Kedaluwarsa");
      return;
    }

    if (paymentStatus === "failed") {
      setIsExpired(true);
      setTimeRemaining("Gagal");
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(expiredAt));
    }, 1000);

    // Initial call
    setTimeRemaining(formatTimeRemaining(expiredAt));

    return () => clearInterval(interval);
  }, [expiredAt, paymentStatus]);

  // Don't show countdown for completed/success payments
  if (!["pending", "expired", "failed"].includes(paymentStatus)) return null;

  // Auto-detect expired/failed state
  const isClientExpired =
    isExpired ||
    paymentStatus === "expired" ||
    paymentStatus === "failed" ||
    timeRemaining === "Kedaluwarsa" ||
    timeRemaining === "Gagal";
  const displayExpired = isClientExpired;
  const isFailed = paymentStatus === "failed" || timeRemaining === "Gagal";

  const isUrgent =
    timeRemaining &&
    !displayExpired &&
    timeRemaining.includes("m") &&
    !timeRemaining.includes("j") &&
    parseInt(timeRemaining.split("m")[0]) <= 10;

  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        displayExpired
          ? isFailed
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
          : isUrgent
            ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30"
            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon
            className={`w-5 h-5 ${
              displayExpired
                ? "text-red-600 dark:text-red-400"
                : isUrgent
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-yellow-600 dark:text-yellow-400"
            }`}
          />
          <div>
            <p
              className={`font-medium text-sm ${
                displayExpired
                  ? "text-red-800 dark:text-red-300"
                  : isUrgent
                    ? "text-orange-800 dark:text-orange-300"
                    : "text-yellow-800 dark:text-yellow-300"
              }`}
            >
              {displayExpired
                ? isFailed
                  ? "Pembayaran Gagal"
                  : "Pembayaran Kedaluwarsa"
                : "Batas Waktu Pembayaran"}
            </p>
            <p
              className={`text-xs ${
                displayExpired
                  ? "text-red-700 dark:text-red-400"
                  : isUrgent
                    ? "text-orange-700 dark:text-orange-400"
                    : "text-yellow-700 dark:text-yellow-400"
              }`}
            >
              {new Date(expiredAt).toLocaleString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="text-right">
          {displayExpired ? (
            <div className="space-y-2">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400">
                {isFailed ? (
                  <XCircleIcon className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircleIcon className="w-3 h-3 mr-1" />
                )}
                {isFailed ? "Gagal" : "Kedaluwarsa"}
              </Badge>
              <p className="text-xs text-red-600 dark:text-red-400">
                {isFailed
                  ? "Pembayaran tidak berhasil diproses"
                  : "Silakan buat pesanan baru"}
              </p>
            </div>
          ) : (
            <Badge
              className={`${
                isUrgent
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400"
              }`}
            >
              <CalendarIcon className="w-3 h-3 mr-1" />
              {timeRemaining}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
