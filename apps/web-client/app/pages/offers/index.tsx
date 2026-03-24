import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { apiClient } from '~/utils/axios'

type Offer = {
  slug: string
  title: string
  description: string
  image: string
  startDate: string // ISO
  endDate: string // ISO
  label: string
}

function formatIDDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return d
  }
}

function getStatus(startISO: string, endISO: string): 'active' | 'upcoming' | 'ended' {
  const now = new Date()
  const start = new Date(startISO)
  const end = new Date(endISO)
  if (now < start) return 'upcoming'
  if (now > end) return 'ended'
  return 'active'
}

type Category = {
  name: string
  slug: string
}

type Post = {
  id: string
  title: string
  slug: string
  image_url: string
  tags: string[]
  is_featured: boolean
  excerpt: string | null
  created_at: string
  category: Category | null
}

type BlogResponse = {
  success: boolean
  message: string
  data: Post[]
  meta: {
    total: number
    total_pages: number
    page: number
    limit: number
  }
}

export default function OffersIndexPage() {
  const [page, setPage] = useState(1)
  const limit = 9

  const postsQuery = useQuery({
    queryKey: ['blog-posts', page, limit],
    queryFn: async () =>
      apiClient
        .get<BlogResponse>('/blog/posts/promo', {
          params: {
            page,
            limit,
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          throw err.response?.data || err
        }),
  })

  const posts = postsQuery.data?.data || []
  const meta = postsQuery.data?.meta
  const totalPages = meta?.total_pages || 1
  const isLoading = postsQuery.isLoading
  const isError = postsQuery.isError
  const errorMessage = (postsQuery.error as any)?.message || 'Gagal memuat data'

  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            Penawaran Khusus
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Offers & Promo Baguspay
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Temukan promo, voucher, dan cashback yang bisa kamu gunakan untuk topup game & PPOB.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Grid */}
      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-border bg-card h-full flex flex-col"
              >
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </div>
            ))
          : null}

        {!isLoading && isError ? (
          <div className="col-span-full rounded-lg border border-destructive/30 bg-destructive/5 text-destructive p-4">
            <p className="font-semibold">Gagal memuat data promo.</p>
            <p className="text-sm text-destructive/80">{errorMessage}</p>
            <button
              type="button"
              className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              onClick={() => postsQuery.refetch()}
            >
              Coba lagi
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && posts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground border border-border rounded-lg py-10">
            Belum ada promo tersedia.
          </div>
        ) : null}

        {!isLoading && !isError
          ? posts.map((post) => {
              const status = getStatus(post.created_at, post.created_at)
              const statusLabel =
                status === 'active' ? 'Aktif' : status === 'upcoming' ? 'Akan Datang' : 'Berakhir'
              const statusColor =
                status === 'active'
                  ? 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800'
                  : status === 'upcoming'
                    ? 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800'
                    : 'text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-800'

              return (
                <Link key={post.slug} to={`/blog/promo/${post.slug}`} className="group">
                  <article className="overflow-hidden rounded-xl border border-border bg-card h-full flex flex-col">
                    <div className="overflow-hidden">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-muted" />
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded-full border border-border">
                          {post.category?.name || 'Promo'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt || 'Promo spesial Baguspay.'}
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-foreground">Diterbitkan:</span>
                          <time>{formatIDDate(post.created_at)}</time>
                        </span>
                      </div>
                      <span className="mt-3 text-sm font-medium text-primary">Lihat detail →</span>
                    </div>
                  </article>
                </Link>
              )
            })
          : null}
      </section>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          <button
            type="button"
            className="px-3 py-2 rounded-md border border-border bg-card disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Sebelumnya
          </button>
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            className="px-3 py-2 rounded-md border border-border bg-card disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Berikutnya
          </button>
        </div>
      ) : null}
    </div>
  )
}
