import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { apiClient } from "~/utils/axios";

export default function HomeProductSections() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const productSections = useQuery({
    queryKey: ["product-sections"],
    queryFn: () =>
      apiClient
        .get<ProductSectionsResponse>("/home/product-sections")
        .then((res) => res.data.data)
        .catch(() => {
          throw new Error("Failed to fetch product sections");
        }),
  });

  if (productSections.isLoading) {
    return (
      <section className="mt-10 space-y-6">
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card/60 shadow-sm p-3 space-y-3 animate-pulse"
            >
              <div className="aspect-square w-full rounded-lg bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (productSections.isError) {
    return (
      <section className="mt-10 space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Product Sections
        </h2>
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Error loading product sections
        </div>
      </section>
    );
  }

  const sections = productSections.data ?? [];

  const toggleSection = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const VISIBLE_LIMIT = 16;

  return (
    <div className="mt-10 space-y-12">
      {sections.map((section) => {
        const sectionKey = `${section.name}-${section.order}`;
        const isExpanded = Boolean(expanded[sectionKey]);
        const total = section.product_categories.length;
        const visibleCount = isExpanded
          ? total
          : Math.min(VISIBLE_LIMIT, total);
        const toRender = section.product_categories.slice(0, visibleCount);

        return (
          <section key={sectionKey} className="mt-4 space-y-3">
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {section.name}
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-8 mt-6">
              {toRender.map((item) => (
                <Link
                  key={item.id}
                  to={`/order/${item.slug}`}
                  className="h-full group"
                >
                  <div className="overflow-hidden rounded-xl h-full flex flex-col relative transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <div className="overflow-hidden relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="transition-all duration-500 object-cover w-full aspect-square group-hover:brightness-110"
                        loading="lazy"
                      />

                      {/* Shimmer Effect on Hover */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out pointer-events-none" />

                      {/* Featured Badge */}
                      {item.is_featured && (
                        <div className="absolute top-2 left-2 bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                          ⭐ FEATURED
                        </div>
                      )}

                      {/* Label (prefer item.label, fallback to section.label) */}
                      {item.label || section.label ? (
                        <div className="absolute top-2 right-2 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                          {item.label ?? section.label}
                        </div>
                      ) : null}
                    </div>

                    <div className="px-2 pt-2 pb-6 bg-secondary dark:bg-card flex-1 flex flex-col relative overflow-hidden">
                      {/* Background Gradient Animation */}
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <h3 className="font-semibold text-foreground text-ellipsis line-clamp-1 relative z-10 transition-all duration-300 group-hover:text-primary">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 relative z-10 transition-all duration-300 group-hover:text-primary/80">
                        {item.publisher}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {total > visibleCount ? (
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <span>Tampilkan lebih banyak</span>
                  <span className="text-xs text-primary/80">
                    ({total - visibleCount} lainnya)
                  </span>
                </button>
              </div>
            ) : total > VISIBLE_LIMIT ? (
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  Tampilkan lebih sedikit
                </button>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export interface ProductSectionsResponse {
  success: boolean;
  message: string;
  data: ProductSection[];
}

export interface ProductSection {
  name: string;
  image_url: string;
  order: number;
  is_featured: boolean;
  label: string;
  product_categories: ProductCategory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  sub_name?: string;
  slug: string;
  image_url: string;
  icon_url?: string;
  is_featured: boolean;
  is_available: boolean;
  label?: string;
  publisher: string;
  tags1: any[];
  tags2: any[];
}
