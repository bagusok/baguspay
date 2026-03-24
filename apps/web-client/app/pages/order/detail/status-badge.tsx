import { OrderStatus, PaymentStatus, RefundStatus } from '@repo/db/types'
import { Badge } from '@repo/ui/components/ui/badge'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  XCircleIcon,
} from 'lucide-react'

type StatusType = 'payment' | 'order' | 'refund'

type Props = {
  type: StatusType
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function StatusBadge({ type, status, size = 'md', showIcon = true }: Props) {
  const getStatusConfig = (type: StatusType, status: string) => {
    const normalizedStatus = status.toLowerCase()

    switch (type) {
      case 'payment':
        switch (normalizedStatus) {
          case PaymentStatus.PENDING:
            return {
              variant: 'soft-yellow',
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: 'Menunggu Pembayaran',
            }
          case PaymentStatus.SUCCESS:
            return {
              variant: 'soft-green',
              icon: <CheckCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Dibayar',
            }
          case PaymentStatus.FAILED:
            return {
              variant: 'soft-red',
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Pembayaran Gagal',
            }
          case PaymentStatus.EXPIRED:
            return {
              variant: 'soft-gray',
              icon: <AlertCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Pembayaran Kedaluwarsa',
            }
          case PaymentStatus.CANCELLED:
            return {
              variant: 'soft-gray',
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Pembayaran Dibatalkan',
            }
          default:
            return {
              variant: 'soft-gray',
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: status,
            }
        }

      case 'order':
        switch (normalizedStatus) {
          case OrderStatus.NONE:
            return {
              variant: 'soft-gray',
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: 'Belum Diproses',
            }
          case OrderStatus.PENDING:
            return {
              variant: 'soft-yellow',
              icon: <RefreshCwIcon className="w-3 h-3 mr-1" />,
              label: 'Sedang Diproses',
            }
          case OrderStatus.COMPLETED:
            return {
              variant: 'soft-green',
              icon: <CheckCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Selesai',
            }
          case OrderStatus.CANCELLED:
            return {
              variant: 'soft-gray',
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Dibatalkan',
            }
          case OrderStatus.FAILED:
            return {
              variant: 'soft-red',
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Gagal',
            }
          default:
            return {
              variant: 'soft-gray',
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: status,
            }
        }

      case 'refund':
        switch (normalizedStatus) {
          case RefundStatus.NONE:
            return {
              variant: 'soft-gray',
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: 'Tidak Ada Refund',
            }
          case RefundStatus.PROCESSING:
            return {
              variant: 'soft-blue',
              icon: <RefreshCwIcon className="w-3 h-3 mr-1" />,
              label: 'Sedang Diproses',
            }
          case RefundStatus.COMPLETED:
            return {
              variant: 'soft-green',
              icon: <CheckCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Refund Selesai',
            }
          case RefundStatus.FAILED:
            return {
              variant: 'soft-red',
              icon: <XCircleIcon className="w-3 h-3 mr-1" />,
              label: 'Refund Gagal',
            }
          default:
            return {
              variant: 'soft-gray',
              icon: <ClockIcon className="w-3 h-3 mr-1" />,
              label: status,
            }
        }

      default:
        return {
          variant: 'soft-gray',
          icon: <ClockIcon className="w-3 h-3 mr-1" />,
          label: status,
        }
    }
  }

  const config = getStatusConfig(type, status)

  return (
    <Badge variant={config.variant as any}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  )
}
