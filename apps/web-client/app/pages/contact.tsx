import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Facebook,
  HelpCircle,
  Instagram,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";

export default function Contact() {
  const SUPPORT_EMAIL = "support@baguspay.id"; // TODO: ganti dengan email resmi
  const WHATSAPP_URL = "https://wa.me/6281234567890"; // TODO: ganti dengan nomor WA resmi
  const TELEGRAM_URL = "https://t.me/baguspay"; // TODO: ganti dengan username Telegram resmi
  const INSTAGRAM_URL = "https://instagram.com/baguspay"; // TODO: ganti dengan username Instagram resmi
  const FACEBOOK_URL = "https://facebook.com/baguspay"; // TODO: ganti dengan halaman Facebook resmi

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Lengkapi semua field terlebih dahulu.");
      return;
    }
    setLoading(true);
    const body = `Halo Baguspay,%0D%0A%0D%0A${encodeURIComponent(
      message,
    )}%0D%0A%0D%0A--%0D%0ANama: ${encodeURIComponent(
      name,
    )}%0D%0AEmail: ${encodeURIComponent(email)}%0D%0ADikirim dari halaman Kontak`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${body}`;
    // Buka aplikasi email default
    window.location.href = mailto;
    // Reset form state ringan
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <HelpCircle className="size-4" />
            Pusat Bantuan Baguspay
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Kontak Kami
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Ada pertanyaan, kendala transaksi, atau ingin kerja sama? Kirimkan
            pesan melalui formulir di bawah atau pilih opsi bantuan yang
            tersedia.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/faq"
              className="text-xs md:text-sm bg-secondary text-foreground px-3 py-1 rounded-full border border-border"
            >
              Lihat FAQ
            </Link>
            <Link
              to="/about"
              className="text-xs md:text-sm bg-secondary text-foreground px-3 py-1 rounded-full border border-border"
            >
              Tentang Baguspay
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Quick options */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <QuickCard
          icon={<Mail className="size-5" />}
          title="Masalah Transaksi"
          desc="Sampaikan detail kendala Anda agar tim kami bisa bantu lebih cepat."
        />
        <QuickCard
          icon={<MessageSquare className="size-5" />}
          title="Kerja Sama / Reseller"
          desc="Tertarik kolaborasi atau menjadi mitra? Tinggalkan pesan Anda."
        />
      </section>

      {/* Other channels */}
      <section className="mt-6 md:mt-10 rounded-2xl border border-border bg-background p-5 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          Opsi Kontak Lain
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih kanal yang paling nyaman untuk Anda.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Catatan: Link di atas menggunakan akun/nomor contoh. Mohon sesuaikan
          dengan akun resmi.
        </div>
      </section>

      {/* Contact form */}
      <section className="mt-12 rounded-2xl border border-border bg-card/50 p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">
          Form Kontak
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kami biasanya merespons dalam beberapa jam pada hari kerja.
        </p>

        <form
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Nama Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="subject">Subjek</Label>
            <Input
              id="subject"
              placeholder="Ringkasan pesan"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="message">Pesan</Label>
            <textarea
              id="message"
              className="min-h-32 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Jelaskan kebutuhan atau kendala Anda..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Batalkan
            </Link>
            <Button type="submit" disabled={loading}>
              <Send className="mr-2 size-4" />
              {loading ? "Mengirim..." : "Kirim Pesan"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function QuickCard({
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
