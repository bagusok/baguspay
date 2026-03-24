import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  orderId: string
}

export default function CancelTransactionModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  orderId,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batalkan Transaksi</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-left mt-4">
          Apakah Anda yakin ingin membatalkan transaksi dengan Order ID{' '}
          <code className="px-1 py-0.5 bg-muted rounded text-sm font-mono">{orderId}</code>
          ?
          <br />
          <br />
          <strong className="text-red-600 dark:text-red-400">
            Peringatan: Tindakan ini tidak dapat dibatalkan.
          </strong>
          <br />
          Setelah transaksi dibatalkan, Anda perlu membuat pesanan baru jika masih ingin melakukan
          pembelian.
        </DialogDescription>
        <DialogFooter className="gap-2">
          <DialogClose>
            <Button variant="destructive" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
          </DialogClose>

          <Button variant="secondary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Membatalkan...' : 'Ya, Batalkan Transaksi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
