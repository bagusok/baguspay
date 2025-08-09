import { Button } from "@repo/ui/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import { memo } from "react";

interface Props {
  payUrl: string;
  paymentName: string;
}

export default memo(function LinkPayment({ payUrl, paymentName }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Klik tombol di bawah untuk melakukan pembayaran melalui {paymentName}
        </p>
        <Button asChild size="lg" className="w-full gap-2">
          <a href={payUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="w-4 h-4" />
            Bayar Sekarang via {paymentName}
          </a>
        </Button>
      </div>
      <div className="p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border-l-4 border-green-300">
        <p className="text-xs text-green-700 dark:text-green-300">
          🔒 <strong>Aman:</strong> Link akan membawa Anda ke halaman pembayaran
          resmi
        </p>
      </div>
    </div>
  );
});
