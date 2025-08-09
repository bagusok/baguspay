import { Link } from "react-router";

type Offer = {
  slug: string;
  title: string;
  description: string;
  image: string;
  startDate: string; // ISO
  endDate: string; // ISO
  label: string;
};

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const offers: Offer[] = Array.from({ length: 9 }).map((_, i) => ({
  slug: `super-promo-${i + 1}`,
  title: `Promo Hemat Spesial #${i + 1}`,
  description:
    "Nikmati diskon menarik untuk topup game & PPOB selama periode promo berlangsung.",
  image: `https://picsum.photos/seed/baguspay-offer-${i}/600/400`,
  // Mix of active, upcoming, and ended
  startDate: addDays(i - 3),
  endDate: addDays(i + 3),
  label: i % 3 === 0 ? "Voucher" : i % 3 === 1 ? "Promo" : "Cashback",
}));

function formatIDDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function getStatus(
  startISO: string,
  endISO: string,
): "active" | "upcoming" | "ended" {
  const now = new Date();
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

export default function OffersIndexPage() {
  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            Penawaran Khusus
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Offers & Promo Baguspay
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Temukan promo, voucher, dan cashback yang bisa kamu gunakan untuk
            topup game & PPOB.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Grid */}
      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {offers.map((offer) => {
          const status = getStatus(offer.startDate, offer.endDate);
          const statusLabel =
            status === "active"
              ? "Aktif"
              : status === "upcoming"
                ? "Akan Datang"
                : "Berakhir";
          const statusColor =
            status === "active"
              ? "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800"
              : status === "upcoming"
                ? "text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800"
                : "text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-800";

          return (
            <Link
              key={offer.slug}
              to={`/offers/${offer.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-xl border border-border bg-card h-full flex flex-col">
                <div className="overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="bg-secondary px-2 py-0.5 rounded-full border border-border">
                      {offer.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full border ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                    {offer.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                    {offer.description}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-medium text-foreground">
                        Periode:
                      </span>
                      <time>{formatIDDate(offer.startDate)}</time>
                      <span>—</span>
                      <time>{formatIDDate(offer.endDate)}</time>
                    </span>
                  </div>
                  <span className="mt-3 text-sm font-medium text-primary">
                    Lihat detail →
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
