import {
  Facebook,
  Link as LinkIcon,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";

export default function BlogDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "dummy-post";
  const title = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [toc, setToc] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const container = contentRef.current;
    const headings = Array.from(
      container.querySelectorAll<HTMLHeadingElement>("h2, h3"),
    );
    const items: Array<{ id: string; text: string; level: number }> = [];
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    headings.forEach((h) => {
      const text = h.textContent ?? "";
      if (!text) return;
      const id = h.id || slugify(text);
      h.id = id;
      items.push({ id, text, level: h.tagName === "H2" ? 2 : 3 });
    });
    setToc(items);

    const words = (container.innerText || "").trim().split(/\s+/).length;
    setReadingTime(Math.max(1, Math.round(words / 200)));
  }, []);

  return (
    <div className="md:max-w-7xl mx-auto">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/blog" className="hover:underline">
          Blog
        </Link>{" "}
        / <span className="text-foreground/80">{title}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dipublikasikan pada{" "}
        {new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
        {readingTime ? ` • ${readingTime} menit baca` : null}
      </p>

      <SocialShare title={title} url={currentUrl} />
      <img
        src={`https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450`}
        srcSet={`https://picsum.photos/seed/${encodeURIComponent(slug)}/800/450 800w, https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/675 1200w, https://picsum.photos/seed/${encodeURIComponent(slug)}/1600/900 1600w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        alt={title}
        className="mt-4 w-full h-auto rounded-xl"
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          <div
            ref={contentRef}
            className="prose dark:prose-invert prose-sm md:prose-base"
          >
            <p>
              Ini adalah artikel dummy untuk menampilkan halaman detail blog.
              Gunakan halaman ini sebagai template untuk menampilkan konten
              sebenarnya dari API/CMS Anda.
            </p>
            <p>
              Baguspay menyediakan layanan topup game dan PPOB yang cepat, aman,
              dan harga bersahabat. Anda dapat menambahkan tips, panduan, dan
              pengumuman promo di blog ini untuk membantu pengguna.
            </p>
            <h2>Subjudul Contoh</h2>
            <p>Beberapa praktik terbaik saat menulis di blog:</p>
            <ul>
              <li>Gunakan gambar ilustrasi dari Picsum Photos.</li>
              <li>Tulis ringkas dan informatif.</li>
              <li>Tambahkan CTA ke produk/fitur terkait.</li>
            </ul>
            <h3>Tips Tambahan</h3>
            <p>
              Pastikan struktur heading rapi agar daftar isi terbentuk otomatis.
            </p>
            <p>
              Terima kasih telah membaca. Kembali ke{" "}
              <Link to="/blog">daftar artikel</Link> untuk melihat tulisan
              lainnya.
            </p>
          </div>
        </div>
        <aside className="lg:col-span-3">
          <TableOfContents items={toc} />
        </aside>
      </div>
    </div>
  );
}

function SocialShare({ title, url }: { title: string; url: string }) {
  const shareUrl = encodeURIComponent(url || "");
  const text = encodeURIComponent(title);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else if (typeof window !== "undefined") {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-4 flex items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Share2 className="size-4" /> Bagikan:
      </span>
      <a
        className="inline-flex items-center gap-1 hover:text-blue-600"
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke Facebook"
        title="Facebook"
      >
        <Facebook className="size-4" />
      </a>
      <a
        className="inline-flex items-center gap-1 hover:text-sky-500"
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke Twitter/X"
        title="Twitter/X"
      >
        <Twitter className="size-4" />
      </a>
      <a
        className="inline-flex items-center gap-1 hover:text-emerald-600"
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke WhatsApp"
        title="WhatsApp"
      >
        <MessageCircle className="size-4" />
      </a>
      <a
        className="inline-flex items-center gap-1 hover:text-sky-600"
        href={`https://t.me/share/url?url=${shareUrl}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke Telegram"
        title="Telegram"
      >
        <Send className="size-4" />
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground"
        aria-label="Salin tautan"
        title="Salin tautan"
      >
        <LinkIcon className="size-4" /> {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

function TableOfContents({
  items,
}: {
  items: Array<{ id: string; text: string; level: number }>;
}) {
  if (!items?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-4 sticky top-24">
      <p className="text-sm font-semibold mb-2">Daftar Isi</p>
      <nav className="text-sm space-y-1">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`block hover:underline text-muted-foreground ${it.level === 3 ? "pl-4" : "pl-0"}`}
          >
            {it.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
