import { Button } from "@repo/ui/components/ui/button";
import { CopyIcon, StoreIcon } from "lucide-react";
import { memo, useCallback } from "react";

interface Props {
  payCode: string;
  paymentName: string;
  onCopy: (text: string, fieldName: string) => void;
}

export default memo(function RetailPayment({
  payCode,
  paymentName,
  onCopy,
}: Props) {
  const handleCopy = useCallback(() => {
    onCopy(payCode, "Kode Pembayaran");
  }, [onCopy, payCode]);
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Kode Pembayaran {paymentName}
        </p>
        <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 rounded-lg">
          <code className="flex-1 text-center text-lg font-mono font-bold text-purple-800 dark:text-purple-300">
            {payCode}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            <CopyIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Tunjukkan kode ini ke kasir {paymentName} untuk melakukan pembayaran
      </div>
      <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border-l-4 border-purple-300">
        <div className="flex items-center gap-2">
          <StoreIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <p className="text-xs text-purple-700 dark:text-purple-300">
            <strong>Cara Bayar:</strong> Datang ke outlet {paymentName} →
            Tunjukkan kode → Bayar tunai
          </p>
        </div>
      </div>
    </div>
  );
});
