import { HelpCircle } from "lucide-react";
import { Link } from "react-router";

export default function Faq() {
  const faqs: { q: string; a: string }[] = [
    {
      q: "Apa itu Baguspay?",
      a: "Baguspay adalah platform topup game dan PPOB untuk pulsa, paket data, e-wallet, tagihan, dan voucher digital dengan proses cepat dan aman.",
    },
    {
      q: "Berapa lama proses topup?",
      a: "Sebagian besar pesanan diproses otomatis dalam hitungan detik-menit. Waktu dapat bervariasi tergantung antrian dan mitra.",
    },
    {
      q: "Metode pembayaran apa saja yang didukung?",
      a: "Kami mendukung e-wallet, virtual account, retail, dan metode lain yang tersedia pada saat checkout.",
    },
    {
      q: "Apakah bisa refund?",
      a: "Refund dapat diajukan pada kondisi tertentu (mis. saldo belum masuk/kendala dari mitra) sesuai hasil investigasi. Hubungi support untuk bantuan.",
    },
    {
      q: "Saya salah input ID/nomor, apa yang harus dilakukan?",
      a: "Mohon periksa kembali data sebelum pembayaran. Kesalahan input oleh pengguna tidak menjadi tanggung jawab Baguspay, namun Anda dapat menghubungi support untuk pengecekan lanjutan.",
    },
  ];

  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <HelpCircle className="size-4" />
            Pusat Bantuan
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Temukan jawaban cepat untuk pertanyaan umum. Jika masih butuh
            bantuan, hubungi tim kami.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* FAQ list */}
      <section className="mt-10 rounded-2xl border border-border bg-card/50 p-4 md:p-6">
        <div className="divide-y divide-border">
          {faqs.map((item, idx) => (
            <details key={idx} className="group py-3">
              <summary className="cursor-pointer list-none select-none flex items-start justify-between gap-4 py-2 text-sm font-medium hover:underline">
                <span className="text-foreground">{item.q}</span>
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
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="mt-10 rounded-2xl border border-border bg-secondary/30 p-5 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          Masih butuh bantuan?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Hubungi tim kami dan kami akan dengan senang hati membantu Anda.
        </p>
        <div className="mt-3">
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
