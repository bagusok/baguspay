import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { AlertTriangleIcon } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  orderId: string;
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
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle>Batalkan Transaksi</DialogTitle>
          </div>
          <DialogDescription className="text-left mt-4">
            Apakah Anda yakin ingin membatalkan transaksi dengan Order ID{" "}
            <code className="px-1 py-0.5 bg-muted rounded text-sm font-mono">
              {orderId}
            </code>
            ?
            <br />
            <br />
            <strong className="text-red-600 dark:text-red-400">
              Peringatan: Tindakan ini tidak dapat dibatalkan.
            </strong>
            <br />
            Setelah transaksi dibatalkan, Anda perlu membuat pesanan baru jika
            masih ingin melakukan pembelian.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Membatalkan..." : "Ya, Batalkan Transaksi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
