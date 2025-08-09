import { Badge } from "@repo/ui/components/ui/badge";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react";

type StatusType = "payment" | "order" | "refund";

type Props = {
  type: StatusType;
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
};

export default function StatusBadge({
  type,
  status,
  size = "md",
  showIcon = true,
}: Props) {
  const getStatusConfig = (type: StatusType, status: string) => {
    const normalizedStatus = status.toLowerCase();

    switch (type) {
      case "payment":
        switch (normalizedStatus) {
          case "pending":
            return {
              variant:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400",
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: "Menunggu Pembayaran",
            };
          case "success":
          case "paid":
            return {
              variant:
                "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
              icon: <CheckCircleIcon className="w-3 h-3 mr-1" />,
              label: "Dibayar",
            };
          case "failed":
            return {
              variant:
                "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: "Gagal",
            };
          case "expired":
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <AlertCircleIcon className="w-3 h-3 mr-1" />,
              label: "Kedaluwarsa",
            };
          case "cancelled":
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: "Dibatalkan",
            };
          default:
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: status,
            };
        }

      case "order":
        switch (normalizedStatus) {
          case "none":
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: "Belum Diproses",
            };
          case "pending":
            return {
              variant:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400",
              icon: <RefreshCwIcon className="w-3 h-3 mr-1" />,
              label: "Sedang Diproses",
            };
          case "completed":
            return {
              variant:
                "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
              icon: <CheckCircleIcon className="w-3 h-3 mr-1" />,
              label: "Selesai",
            };
          case "cancelled":
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: "Dibatalkan",
            };
          case "failed":
            return {
              variant:
                "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: "Gagal",
            };
          default:
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: status,
            };
        }

      case "refund":
        switch (normalizedStatus) {
          case "none":
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: "Tidak Ada Refund",
            };
          case "processing":
            return {
              variant:
                "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400",
              icon: <RefreshCwIcon className="w-3 h-3 mr-1" />,
              label: "Sedang Diproses",
            };
          case "completed":
            return {
              variant:
                "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
              icon: <CheckCircleIcon className="w-3 h-3 mr-1" />,
              label: "Refund Selesai",
            };
          case "failed":
            return {
              variant:
                "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: "Refund Gagal",
            };
          default:
            return {
              variant:
                "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: status,
            };
        }

      default:
        return {
          variant:
            "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
          icon: <ClockIcon className="w-3 h-3 mr-1" />,
          label: status,
        };
    }
  };

  const config = getStatusConfig(type, status);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-2",
  };

  return (
    <Badge
      className={`${config.variant} ${sizeClasses[size]} rounded-full font-medium`}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}
