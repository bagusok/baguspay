import { DepositStatus } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Label } from '@repo/ui/components/ui/label'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import { cn } from '@repo/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { EyeIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '~/utils/axios'

type Props = {
  depositId: string
}

export default function DetailDepositModal(props: Props) {
  const [open, setOpen] = useState(false)

  const detailDeposit = useMutation({
    mutationKey: ['detailDeposit', props.depositId],
    mutationFn: async () =>
      apiClient
        .get(`/admin/deposits/${props.depositId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.error('Error fetching deposit details:', err)
          throw new Error('Failed to fetch deposit details')
        }),
  })

  useEffect(() => {
    if (open) {
      detailDeposit.mutate()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <EyeIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="md:min-w-xl lg:min-w-3xl w-full max-h-5/6">
        <DialogHeader>
          <DialogTitle>Deposit Detail</DialogTitle>
          <DialogDescription>
            Informasi lengkap deposit ID:{' '}
            <span className="font-semibold">
              {detailDeposit.data?.data?.deposit_id || props.depositId}
            </span>
          </DialogDescription>
        </DialogHeader>
        {detailDeposit.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        ) : detailDeposit.isError ? (
          <div className="text-red-500 text-center py-4">
            Gagal mengambil detail detailDeposit.data?.data.
          </div>
        ) : detailDeposit.data?.data ? (
          <div className="space-y-6 py-2 overflow-y-auto max-h-5/6">
            {/* User Info */}
            <div>
              <div className="font-semibold text-base mb-2 border-b pb-1">User Info</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1">User ID</Label>
                  <div>{detailDeposit.data?.data.user_id}</div>
                </div>
                <div>
                  <Label className="mb-1">User Name</Label>
                  <div>{detailDeposit.data?.data.user?.name || '-'}</div>
                </div>
                <div>
                  <Label className="mb-1">User Email</Label>
                  <div>{detailDeposit.data?.data.user?.email || '-'}</div>
                </div>
                <div>
                  <Label className="mb-1">Phone Number</Label>
                  <div>{detailDeposit.data?.data.phone_number || '-'}</div>
                </div>
              </div>
            </div>
            {/* Payment Info */}
            <div>
              <div className="font-semibold text-base mb-2 border-b pb-1">Payment Info</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1">Payment Method ID</Label>
                  <div>{detailDeposit.data?.data.payment_method?.id || '-'}</div>
                </div>
                <div>
                  <Label className="mb-1">Payment Method</Label>
                  <div>{detailDeposit.data?.data.payment_method?.name || '-'}</div>
                </div>
                <div>
                  <Label className="mb-1">Provider</Label>
                  <div>{detailDeposit.data?.data.payment_method?.provider_name || '-'}</div>
                </div>
                <div>
                  <Label className="mb-1">Payment Email</Label>
                  <div>{detailDeposit.data?.data.email || '-'}</div>
                </div>
                <div>
                  <Label className="mb-1">Payment Phone</Label>
                  <div>{detailDeposit.data?.data.phone_number || '-'}</div>
                </div>
              </div>
            </div>
            {/* Deposit Info */}
            <div>
              <div className="font-semibold text-base mb-2 border-b pb-1">Deposit Info</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1">Deposit ID</Label>
                  <div className="font-medium">{detailDeposit.data?.data.deposit_id}</div>
                </div>
                <div>
                  <Label className="mb-1">Ref ID</Label>
                  <div>{detailDeposit.data?.data.ref_id}</div>
                </div>
                <div>
                  <Label className="mb-1">Status</Label>
                  <div
                    className={cn('capitalize font-semibold p-1 rounded', {
                      'bg-red-200 text-red-500':
                        detailDeposit.data?.data.status === DepositStatus.FAILED,
                      'bg-yellow-200 text-yellow-500':
                        detailDeposit.data?.data.status === DepositStatus.PENDING,
                      'bg-green-200 text-green-500':
                        detailDeposit.data?.data.status === DepositStatus.COMPLETED,
                      'bg-gray-200 text-gray-500':
                        detailDeposit.data?.data.status === DepositStatus.EXPIRED,
                      'bg-slate-200 text-slate-500':
                        detailDeposit.data?.data.status === DepositStatus.CANCELED,
                    })}
                  >
                    {detailDeposit.data?.data.status}
                  </div>
                </div>

                <div>
                  <Label className="mb-1">Amount Pay</Label>
                  <div>{detailDeposit.data?.data.amount_pay?.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="mb-1">Amount Received</Label>
                  <div>{detailDeposit.data?.data.amount_received?.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="mb-1">Amount Fee</Label>
                  <div>{detailDeposit.data?.data.amount_fee?.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="mb-1">Pay Code</Label>
                  <div>{detailDeposit.data?.data.pay_code || '-'}</div>
                </div>
                <div>
                  <Label className="mb-1">Pay URL</Label>
                  <div className="truncate text-blue-600 underline">
                    {detailDeposit.data?.data.pay_url ? (
                      <a
                        href={detailDeposit.data?.data.pay_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {detailDeposit.data?.data.pay_url}
                      </a>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
                <div>
                  <Label className="mb-1">QR Code</Label>
                  <div className="truncate">{detailDeposit.data?.data.qr_code || '-'}</div>
                </div>
              </div>
            </div>
            {/* Other Info */}
            <div>
              <div className="font-semibold text-base mb-2 border-b pb-1">Other Info</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1">Created At</Label>
                  <div>
                    {detailDeposit.data?.data.created_at
                      ? new Date(detailDeposit.data?.data.created_at).toLocaleString()
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="mb-1">Updated At</Label>
                  <div>
                    {detailDeposit.data?.data.updated_at
                      ? new Date(detailDeposit.data?.data.updated_at).toLocaleString()
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="mb-1">Expired At</Label>
                  <div>
                    {detailDeposit.data?.data.expired_at
                      ? new Date(detailDeposit.data?.data.expired_at).toLocaleString()
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
