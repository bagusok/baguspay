import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  ClockIcon,
  Loader2Icon,
  SearchIcon,
  TicketCheckIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type MockOrder = {
  order_id: string;
  created_at: string;
  order_status: "pending" | "success" | "failed";
  payment_status: "pending" | "success" | "failed" | "expired";
  total_price: number;
};

function formatIDR(n: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rp ${n.toLocaleString("id-ID")}`;
  }
}

function getStatusBadge(orderStatus: string, paymentStatus: string) {
  if (orderStatus === "success" && paymentStatus === "success") {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Berhasil
      </Badge>
    );
  } else if (orderStatus === "pending" || paymentStatus === "pending") {
    return <Badge variant="secondary">Diproses</Badge>;
  } else if (
    orderStatus === "failed" ||
    paymentStatus === "failed" ||
    paymentStatus === "expired"
  ) {
    return <Badge variant="destructive">Gagal</Badge>;
  } else {
    return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function CheckOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MockOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => !orderId || loading, [orderId, loading]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!orderId.trim()) return;
    setLoading(true);

    // UI only: simulate a short lookup delay and deterministic mock result
    window.setTimeout(() => {
      const score = Array.from(orderId).reduce(
        (acc, ch) => acc + ch.charCodeAt(0),
        0,
      );
      const statusPick = score % 3;
      const order_status =
        statusPick === 0 ? "pending" : statusPick === 1 ? "success" : "failed";
      const payment_status =
        statusPick === 1 ? "success" : statusPick === 2 ? "failed" : "pending";
      const daysAgo = (score % 10) + 1;
      const created = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const total = 10000 * (1 + (score % 15));
      setResult({
        order_id: orderId.trim(),
        created_at: created.toISOString(),
        order_status: order_status as MockOrder["order_status"],
        payment_status: payment_status as MockOrder["payment_status"],
        total_price: total,
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            Cek Status Order
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Lacak Pesanan Anda
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">
            Masukkan Order ID untuk melihat status terbaru dari pesanan Anda.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Form */}
      <section className="mt-8 rounded-xl border border-border bg-card p-4 md:p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <div className="flex gap-2">
                <Input
                  id="orderId"
                  placeholder="Contoh: BGSPY-123456"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  autoComplete="off"
                />
                <Button type="submit" disabled={disabled} className="shrink-0">
                  {loading ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      <span className="ml-2">Memeriksa...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="size-4" />
                      <span className="ml-2">Cek Status</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Hanya masukkan Order ID tanpa spasi. Contoh bisa ditemukan pada
                email/riwayat pesanan Anda.
              </p>
            </div>
          </div>
        </form>
      </section>

      {/* Result */}
      <section className="mt-6">
        {!result && !loading && !error ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Masukkan Order ID kemudian klik "Cek Status" untuk melihat hasil.
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-border p-6 flex items-center gap-3">
            <Loader2Icon className="size-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Mengambil data pesanan...
            </span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        ) : null}

        {result && !loading ? (
          <article className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TicketCheckIcon className="size-5 text-primary" />
                <h2 className="font-semibold">Order #{result.order_id}</h2>
              </div>
              {getStatusBadge(result.order_status, result.payment_status)}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-medium break-all">{result.order_id}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Status Pembayaran</p>
                <p className="font-medium capitalize">
                  {result.payment_status}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Status Order</p>
                <p className="font-medium capitalize">{result.order_status}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">{formatIDR(result.total_price)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ClockIcon className="size-4" />
              <time>
                Dibuat pada{" "}
                {new Date(result.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
