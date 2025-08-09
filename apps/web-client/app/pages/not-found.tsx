import { Button } from "@repo/ui/components/ui/button";
import { Home, Search, TriangleAlert } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="md:max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-8 md:p-12 border border-border text-center">
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <TriangleAlert className="size-4" />
            Halaman Tidak Ditemukan
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            404
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari. Link
            mungkin salah atau halaman telah dipindahkan.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 size-4" /> Kembali ke Beranda
              </Link>
            </Button>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition"
            >
              <Search className="mr-2 size-4" /> Butuh bantuan? Kontak Kami
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-border bg-card px-3 py-2 hover:bg-secondary transition"
    >
      {label}
    </Link>
  );
}
