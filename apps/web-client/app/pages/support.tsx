import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  AlertTriangle,
  CheckCircle2,
  Facebook,
  Instagram,
  LifeBuoy,
  MessageCircle,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";

export default function Support() {
  // TODO: Ganti dengan kontak resmi
  const SUPPORT_EMAIL = "hunagus433@gmail.com";
  const WHATSAPP_URL = "https://wa.me/6282122504669";
  const TELEGRAM_URL = "https://t.me/baguspay";
  const INSTAGRAM_URL = "https://instagram.com/baguspay";
  const FACEBOOK_URL = "https://facebook.com/baguspay";

  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string>("");

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !contact)
      return toast.error("Isi Order ID dan Email/No. HP.");
    setLoading("check");
    // TODO: Integrasikan ke endpoint cek status pesanan
    setTimeout(() => {
      setLoading(null);
      setStatusNote(
        `Status pesanan ${orderId} sedang diproses. Jika pembayaran sudah dilakukan, mohon tunggu beberapa menit.`,
      );
      toast.success("Status diperbarui.");
    }, 700);
  };

  const handleResendInstruction = () => {
    if (!orderId || !contact)
      return toast.error("Isi Order ID dan Email/No. HP.");
    setLoading("resend");
    // TODO: Integrasikan kirim ulang instruksi pembayaran
    setTimeout(() => {
      setLoading(null);
      toast.success("Instruksi pembayaran telah dikirim ulang.");
    }, 600);
  };

  const handleRequestRefund = () => {
    if (!orderId || !contact)
      return toast.error("Isi Order ID dan Email/No. HP.");
    setLoading("refund");
    // TODO: Integrasikan pengajuan refund
    setTimeout(() => {
      setLoading(null);
      toast.success("Pengajuan refund dikirim. Tim kami akan meninjau.");
    }, 800);
  };

  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <LifeBuoy className="size-4" />
            Pusat Dukungan Baguspay
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Butuh bantuan dengan pesanan Anda?
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Lacak status pesanan, kirim ulang instruksi pembayaran, atau ajukan
            refund. Anda juga bisa melihat panduan cepat dan status layanan.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Order tools */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/50 p-5 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-foreground">
            Cek Status Pesanan
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Masukkan Order ID dan email/no. HP yang digunakan saat pemesanan.
          </p>
          <form
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={handleCheckStatus}
          >
            <div className="space-y-2">
              <Label htmlFor="order-id">Order ID</Label>
              <Input
                id="order-id"
                placeholder="Contoh: ORD-2024-XXXX"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Email / No. HP</Label>
              <Input
                id="contact"
                placeholder="email@contoh.com atau 08xxxx"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <Button type="submit" disabled={loading === "check"}>
                <Search className="mr-2 size-4" />
                {loading === "check" ? "Mengecek..." : "Cek Status"}
              </Button>
            </div>
          </form>
          {statusNote && (
            <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm text-foreground/90">
              {statusNote}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-5 md:p-6">
          <h3 className="text-base font-semibold text-foreground">
            Tindakan Cepat
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Perlu Order ID dan email/no. HP yang sama dengan saat pemesanan.
          </p>
          <div className="mt-4 grid gap-3">
            <Button
              variant="secondary"
              className="justify-start"
              onClick={handleResendInstruction}
              disabled={loading === "resend"}
            >
              <RefreshCcw className="mr-2 size-4" />
              {loading === "resend"
                ? "Mengirim ulang..."
                : "Kirim Ulang Instruksi Pembayaran"}
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={handleRequestRefund}
              disabled={loading === "refund"}
            >
              <RotateCcw className="mr-2 size-4" />
              {loading === "refund" ? "Mengajukan..." : "Ajukan Refund"}
            </Button>
            <Link
              to="/faq"
              className="text-sm font-medium text-primary hover:underline"
            >
              Lihat FAQ →
            </Link>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mt-10 rounded-2xl border border-border bg-card/50 p-5 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          Panduan Cepat
        </h2>
        <div className="divide-y divide-border mt-3">
          <details className="group py-3">
            <summary className="cursor-pointer list-none select-none flex items-start justify-between gap-4 py-2 text-sm font-medium hover:underline">
              Pembayaran pending atau expired
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-muted-foreground"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="mt-2 text-sm text-muted-foreground leading-6">
              Pastikan membayar tepat waktu sesuai instruksi. Jika terlewat,
              buat pesanan baru atau gunakan tombol kirim ulang instruksi.
            </div>
          </details>
          <details className="group py-3">
            <summary className="cursor-pointer list-none select-none flex items-start justify-between gap-4 py-2 text-sm font-medium hover:underline">
              Topup lambat atau belum masuk
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-muted-foreground"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="mt-2 text-sm text-muted-foreground leading-6">
              Cek status pesanan dan pastikan ID tujuan benar. Sebagian pesanan
              membutuhkan waktu beberapa menit. Jika tetap belum masuk, hubungi
              dukungan.
            </div>
          </details>
          <details className="group py-3">
            <summary className="cursor-pointer list-none select-none flex items-start justify-between gap-4 py-2 text-sm font-medium hover:underline">
              Salah input ID/nomor
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-muted-foreground"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="mt-2 text-sm text-muted-foreground leading-6">
              Verifikasi ID/nomor dari aplikasi/game resminya sebelum membayar.
              Kesalahan input di luar tanggung jawab Baguspay, namun kami tetap
              akan bantu cek.
            </div>
          </details>
        </div>
      </section>

      {/* Service status (placeholder) */}
      <section className="mt-10 rounded-2xl border border-border bg-background p-5 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          Status Layanan
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Informasi ringkas kondisi sistem dan mitra (placeholder).
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatusItem
            icon={<ShieldCheck className="size-4" />}
            label="Gateway Pembayaran"
            status="Normal"
            tone="ok"
          />
          <StatusItem
            icon={<CheckCircle2 className="size-4" />}
            label="Provider Game"
            status="Normal"
            tone="ok"
          />
          <StatusItem
            icon={<AlertTriangle className="size-4" />}
            label="Sistem Baguspay"
            status="Gangguan Minor"
            tone="warn"
          />
        </div>
      </section>

      {/* Contact channels */}
      <section className="mt-10 rounded-2xl border border-border bg-secondary/30 p-5 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          Butuh bantuan langsung?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Hubungi kami melalui kanal berikut atau buka halaman kontak.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition"
          >
            <Send className="size-4" /> Telegram
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition"
          >
            <Instagram className="size-4" /> Instagram
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition"
          >
            <Facebook className="size-4" /> Facebook
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition"
          >
            <LifeBuoy className="size-4" /> Email
          </a>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Catatan: Link di atas menggunakan akun/nomor contoh. Mohon sesuaikan
          dengan akun resmi.
        </div>
        <div className="mt-4">
          <Link
            to="/contact"
            className="text-sm font-medium text-primary hover:underline"
          >
            Buka Halaman Kontak →
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatusItem({
  icon,
  label,
  status,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  tone: "ok" | "warn" | "down";
}) {
  const toneClass =
    tone === "ok"
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : tone === "warn"
        ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
        : "bg-red-500/10 text-red-600 border-red-500/20";
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="rounded-md border border-border bg-background p-1.5 text-foreground/90">
          {icon}
        </div>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full border ${toneClass}`}>
        {status}
      </span>
    </div>
  );
}
