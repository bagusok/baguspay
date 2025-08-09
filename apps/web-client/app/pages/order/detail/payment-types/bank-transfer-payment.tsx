import { Button } from "@repo/ui/components/ui/button";
import { CopyIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

interface Props {
  payCode: string;
  paymentType: "bank_transfer" | "virtual_account";
  onCopy: (text: string, fieldName: string) => void;
}

export default memo(function BankTransferPayment({
  payCode,
  paymentType,
  onCopy,
}: Props) {
  const title = useMemo(() => {
    return paymentType === "virtual_account"
      ? "Nomor Virtual Account"
      : "Kode Transfer";
  }, [paymentType]);

  const instruction = useMemo(() => {
    return paymentType === "virtual_account"
      ? "Transfer ke nomor virtual account di atas sesuai dengan total pembayaran"
      : "Transfer ke nomor rekening di atas sesuai dengan total pembayaran";
  }, [paymentType]);

  const handleCopy = useCallback(() => {
    onCopy(payCode, "Kode Pembayaran");
  }, [onCopy, payCode]);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
          <code className="flex-1 text-center text-lg font-mono font-bold text-blue-800 dark:text-blue-300">
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
        {instruction}
      </div>
      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border-l-4 border-blue-300">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 <strong>Tips:</strong> Pastikan nominal transfer persis sama dengan
          total pembayaran
        </p>
      </div>
    </div>
  );
});
