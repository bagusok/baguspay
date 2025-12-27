import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { LayoutList } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "~/components/image";
import { apiClient } from "~/utils/axios";
import { formatPrice } from "~/utils/format";

type ProductCategory = {
  id: string;
  name: string;
  sub_name: string | null;
  image_url: string | null;
  is_available: boolean;
};

type Product = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  is_available: boolean;
  billing_type: string;
  description: string | null;
  sku_code: string;
  sub_name: string | null;
};

interface ApiListResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  // Updated meta shape based on API: limit, page, total, total_pages
  meta?: { page: number; limit: number; total: number; total_pages: number };
}

export default function ListProductPricePage() {
  const [productQuery, setProductQuery] = useState({
    category_id: "",
    search: "",
    page: 1,
    limit: 50,
  });

  const categoriesQuery = useQuery<ApiListResponse<ProductCategory>>({
    queryKey: ["product-categories"],
    queryFn: async () =>
      apiClient.get("/product-categories").then((r: any) => r.data),
  });

  const productsQuery = useQuery<ApiListResponse<Product>>({
    queryKey: [
      "products",
      productQuery.category_id,
      productQuery.page,
      productQuery.limit,
      productQuery.search,
    ],
    enabled: !categoriesQuery.isLoading,
    queryFn: async () =>
      apiClient
        .get("/products", {
          params: {
            category_id: productQuery.category_id || undefined,
            page: productQuery.page,
            limit: productQuery.limit,
            search: productQuery.search || undefined,
          },
        })
        .then((r: any) => r.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const products: Product[] =
    (productsQuery.data as ApiListResponse<Product> | undefined)?.data ?? [];
  const hasServerPagination = !!productsQuery.data?.meta;
  const meta = productsQuery.data?.meta;
  const canNext = hasServerPagination
    ? (meta?.page ?? 1) < (meta?.total_pages ?? 1)
    : products.length >= productQuery.limit;
  const canPrev = productQuery.page > 1;

  const selectedCategory = useMemo(
    () =>
      categoriesQuery.data?.data.find(
        (c) => c.id === productQuery.category_id,
      ) || null,
    [categoriesQuery.data, productQuery.category_id],
  );

  function setCategory(id: string) {
    setProductQuery((q) => ({ ...q, category_id: id, page: 1 }));
  }
  function nextPage() {
    if (canNext) setProductQuery((q) => ({ ...q, page: q.page + 1 }));
  }
  function prevPage() {
    if (canPrev) setProductQuery((q) => ({ ...q, page: q.page - 1 }));
  }

  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <LayoutList className="size-4" />
            Daftar Harga
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Produk & Harga Terbaru
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Telusuri harga produk digital. Pilih kategori, gunakan pencarian,
            dan navigasi halaman untuk melihat semua.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Categories & Search */}
      <section className="mt-10 rounded-2xl border border-border bg-card/50 p-4 md:p-6 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoriesQuery.isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-32 shrink-0" />
            ))}
          {categoriesQuery.isSuccess && (
            <>
              <Button
                variant={
                  productQuery.category_id === "" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setCategory("")}
                className="shrink-0"
              >
                Semua
              </Button>
              {categoriesQuery.data.data.map((c) => (
                <Button
                  key={c.id}
                  variant={
                    c.id === productQuery.category_id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setCategory(c.id)}
                  className="shrink-0 flex items-center gap-2 pr-3"
                >
                  {c.image_url && (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      className="h-6 w-6 object-cover rounded"
                    />
                  )}
                  <span className="truncate max-w-30">
                    {c.sub_name || c.name}
                  </span>
                </Button>
              ))}
            </>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <Input
            placeholder="Cari produk..."
            value={productQuery.search}
            onChange={(e) =>
              setProductQuery((q) => ({
                ...q,
                search: e.target.value,
                page: 1,
              }))
            }
            className="md:w-72"
          />
          {selectedCategory && (
            <div className="text-xs text-muted-foreground">
              Kategori:{" "}
              <span className="font-medium">{selectedCategory.name}</span>
            </div>
          )}
        </div>
      </section>

      {/* Table Section */}
      <section className="mt-10 rounded-2xl border border-border bg-card/50 p-4 md:p-6">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-2">Produk</th>
                <th className="p-2">Harga</th>
                <th className="p-2 whitespace-nowrap">Billing</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2" colSpan={5}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))}
              {productsQuery.isError && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-destructive">
                    Gagal memuat produk.
                  </td>
                </tr>
              )}
              {productsQuery.isSuccess && products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-muted-foreground"
                  >
                    Tidak ada produk.
                  </td>
                </tr>
              )}
              {productsQuery.isSuccess &&
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-2 align-top">
                      <div className="flex items-start gap-3">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-10 w-10 object-cover rounded"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <div className="font-medium leading-snug">
                            {p.name}
                          </div>
                          {p.sub_name && (
                            <div className="text-[11px] text-muted-foreground">
                              {p.sub_name}
                            </div>
                          )}
                          {p.description && (
                            <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2 max-w-xs">
                              {p.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 font-semibold tabular-nums">
                      {formatPrice(p.price)}
                    </td>
                    <td className="p-2 capitalize">{p.billing_type}</td>
                    <td className="p-2 text-xs font-mono">{p.sku_code}</td>
                    <td className="p-2">
                      {p.is_available ? (
                        <Badge variant="default">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Nonaktif</Badge>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-muted-foreground">
            Halaman {productQuery.page}
            {meta && ` dari ${meta.total_pages} (Total ${meta.total} produk)`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev || productsQuery.isFetching}
              onClick={prevPage}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext || productsQuery.isFetching}
              onClick={nextPage}
            >
              Next
            </Button>
          </div>
        </div>
        {productsQuery.isFetching && !productsQuery.isLoading && (
          <div className="mt-3 text-xs text-muted-foreground">
            Memuat data terbaru…
          </div>
        )}
      </section>
    </div>
  );
}
