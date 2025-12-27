import { ProductGroupingType } from "@repo/db/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useWindowSize } from "usehooks-ts";
import { apiClient } from "~/utils/axios";
import Image from "../image";

export default function FastMenu() {
  const { width } = useWindowSize();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FastMenuData | null>(null);

  const fastmenus = useQuery({
    queryKey: ["fastmenus"],
    queryFn: () =>
      apiClient
        .get<FastMenuResponse>("/home/fast-menus")
        .then((res) => res.data.data)
        .catch(() => {
          throw new Error("Failed to fetch fast menus");
        }),
  });

  const isMobile = useMemo(() => width < 768, [width]);

  const handleClick = (menu: FastMenuData) => {
    if (menu.type === ProductGroupingType.MODAL) {
      setSelected(menu);
      setOpen(true);
    }
  };

  if (fastmenus.isLoading) {
    return (
      <section className="mt-4 space-y-3">
        <div className="h-5 w-28 rounded bg-muted animate-pulse" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mt-1.5 rounded-xl border border-border/70 bg-card/70 p-2 flex items-center gap-2 w-28 md:w-32 shadow-sm animate-pulse"
            >
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-3 w-14 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (fastmenus.isError) {
    return (
      <section className="mt-4 space-y-2">
        <h2 className="text-lg font-bold">Fast Menu</h2>
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Error loading fast menu
        </div>
      </section>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <h2 className="text-lg font-bold">Fast Menu</h2>
      <div className="flex flex-wrap gap-3">
        {fastmenus.data?.map((menu) => {
          const firstCategory = menu.product_categories?.[0];
          const href =
            menu.type === ProductGroupingType.REDIRECT && menu.redirect_url
              ? menu.redirect_url
              : menu.type === ProductGroupingType.CATEGORY && firstCategory
                ? `/order/${firstCategory.slug}`
                : undefined;

          const card = (
            <div className="mt-1.5 rounded-xl border p-2 border-secondary flex flex-col md:flex-row items-center gap-2 w-16 md:w-32 cursor-pointer hover:border-primary transition-colors">
              <Image
                src={menu.image_url}
                alt={menu.name}
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1 flex items-center gap-1">
                  {menu.is_featured ? (
                    <span
                      aria-label="featured"
                      className="text-amber-500 text-xs"
                    >
                      ★
                    </span>
                  ) : null}
                  {menu.name}
                </p>
                {menu.label ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-foreground inline-block mt-0.5">
                    {menu.label}
                  </span>
                ) : null}
              </div>
            </div>
          );

          if (menu.type === ProductGroupingType.MODAL) {
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => handleClick(menu)}
                className="appearance-none p-0 bg-transparent border-0"
              >
                {card}
              </button>
            );
          }

          if (href) {
            return (
              <Link
                key={menu.id}
                to={href}
                className="no-underline text-foreground"
              >
                {card}
              </Link>
            );
          }

          return (
            <div
              key={menu.id}
              onClick={() => handleClick(menu)}
              role="button"
              tabIndex={0}
              className="outline-none"
            >
              {card}
            </div>
          );
        })}
      </div>

      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{null}</SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selected?.name ?? "Menu"}</SheetTitle>
              <SheetDescription>
                Pilih kategori yang tersedia dari menu ini.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {selected?.product_categories?.length ? (
                selected.product_categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/order/${cat.slug}`}
                    className="rounded-lg border border-border/70 p-3 flex items-center gap-2 hover:border-primary transition-colors"
                  >
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      className="h-10 w-10 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {cat.name}
                      </p>
                      {cat.is_featured ? (
                        <span className="text-[10px] text-primary font-semibold">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-2">
                  Tidak ada kategori.
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{null}</DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="space-y-1">
                <p className="text-base font-semibold">
                  {selected?.name ?? "Menu"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pilih kategori yang tersedia dari menu ini.
                </p>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {selected?.product_categories?.length ? (
                selected.product_categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/order/${cat.slug}`}
                    className="rounded-lg border border-border/70 p-3 flex items-center gap-2 hover:border-primary transition-colors"
                  >
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      className="h-10 w-10 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {cat.name}
                      </p>
                      {cat.is_featured ? (
                        <span className="text-[10px] text-primary font-semibold">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-2">
                  Tidak ada kategori.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export interface FastMenuResponse {
  success: boolean;
  message: string;
  data: FastMenuData[];
}

export interface FastMenuData {
  id: string;
  name: string;
  image_url: string;
  redirect_url: any;
  app_key: any;
  platform: string;
  type: ProductGroupingType;
  order: number;
  is_special_feature: boolean;
  special_feature_key: string;
  is_featured: boolean;
  label: string;
  product_categories: ProductCategory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  is_featured: boolean;
  is_available: boolean;
}
