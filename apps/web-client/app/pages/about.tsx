import {
  Clock,
  Headphones,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

export default function About() {
  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <Sparkles className="size-4" />
            Topup Game & PPOB Terpercaya
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Tentang Baguspay
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Satu platform untuk topup game, pulsa, paket data, voucher digital,
            dan berbagai pembayaran tagihan. Cepat, aman, dan harga bersahabat.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Topup Game",
              "Pulsa & Data",
              "E-Wallet & Tagihan",
              "Voucher Digital",
            ].map((chip) => (
              <span
                key={chip}
                className="text-xs md:text-sm bg-secondary text-foreground px-3 py-1 rounded-full border border-border"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Mulai Topup Sekarang
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>

        {/* Subtle gradient blob */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Features */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FeatureCard
          icon={<Clock className="size-5" />}
          title="Cepat & Stabil"
          desc="Pemrosesan otomatis dengan uptime tinggi, bikin transaksi lancar."
        />
        <FeatureCard
          icon={<Zap className="size-5" />}
          title="Harga Kompetitif"
          desc="Harga bersahabat, promo rutin, dan diskon menarik setiap saat."
        />
        <FeatureCard
          icon={<ShieldCheck className="size-5" />}
          title="Aman & Terpercaya"
          desc="Keamanan data dan pembayaran jadi prioritas utama kami."
        />
        <FeatureCard
          icon={<Wallet className="size-5" />}
          title="Banyak Metode Pembayaran"
          desc="Dukungan e-wallet, virtual account, retail, dan saldo."
        />
      </section>

      {/* How it works */}
      <section className="mt-12 rounded-2xl border border-border p-6 md:p-8 bg-card/50">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">
          Cara Kerja
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          4 langkah mudah untuk menyelesaikan transaksi Anda.
        </p>

        <ol className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepItem
            index={1}
            title="Pilih Produk"
            desc="Cari game/layanan PPOB yang Anda butuhkan."
          />
          <StepItem
            index={2}
            title="Isi Data"
            desc="Masukkan ID/nomor dan pilih nominal."
          />
          <StepItem
            index={3}
            title="Bayar"
            desc="Pilih metode pembayaran favorit Anda."
          />
          <StepItem
            index={4}
            title="Selesai"
            desc="Pesanan diproses otomatis dan cepat."
          />
        </ol>
      </section>

      {/* Support */}
      <section className="mt-12 rounded-2xl border border-border p-6 md:p-8 bg-secondary/30">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-lg border border-border bg-background p-2">
            <Headphones className="size-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              Butuh bantuan?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tim support kami siap membantu. Kunjungi halaman kontak untuk
              pertanyaan, masukan, atau kerja sama.
            </p>
            <div className="mt-3">
              <Link
                to="/contact"
                className="text-sm font-medium text-primary hover:underline"
              >
                Buka Halaman Kontak →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-lg border border-border bg-background p-2 text-foreground/90">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function StepItem({
  index,
  title,
  desc,
}: {
  index: number;
  title: string;
  desc: string;
}) {
  return (
    <li className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {index}
        </div>
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>
      </div>
    </li>
  );
}
