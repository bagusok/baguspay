import { Button } from '@repo/ui/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { apiClient } from '~/utils/axios'
import { formatDate } from '~/utils/format'

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

export default function Blog() {
  const [page, setPage] = useState(1)
  const limit = 9

  const postsQuery = useQuery({
    queryKey: ['blog-posts', page, limit],
    queryFn: async () =>
      apiClient
        .get<BlogResponse>('/blog/posts', {
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

  return (
    <div className="md:max-w-7xl mx-auto pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            Wawasan & Tips
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Blog Baguspay
          </h1>
          <p className="mt-3 md:text-base text-muted-foreground w-full md:max-w-3xl">
            Artikel ringan seputar topup game, PPOB, promo, dan update fitur terhangat.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* States */}
      {postsQuery.isLoading && (
        <div className="flex items-center justify-center h-64 mt-10">
          <p className="text-muted-foreground animate-pulse">Memuat artikel...</p>
        </div>
      )}

      {postsQuery.isError && (
        <div className="flex items-center justify-center h-64 mt-10">
          <p className="text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
            Gagal memuat artikel. Silakan coba lagi nanti.
          </p>
        </div>
      )}

      {/* Grid */}
      {postsQuery.isSuccess && (
        <>
          {postsQuery.data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 mt-10 border border-dashed rounded-xl bg-muted/20">
              <p className="text-muted-foreground text-center">
                Belum ada artikel yang diterbitkan.
              </p>
            </div>
          ) : (
            <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {postsQuery.data?.data.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.category?.slug || 'uncategorized'}/${post.slug}`}
                  className="group h-full flex"
                >
                  <article className="overflow-hidden flex flex-col rounded-2xl w-full border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-300">
                    <div className="overflow-hidden aspect-video bg-muted/30 relative border-b border-border/50">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {post.is_featured && (
                        <div className="absolute top-3 left-3 bg-primary/95 text-primary-foreground text-[10px] px-2.5 py-1 font-semibold rounded-md shadow-sm backdrop-blur-sm">
                          Terpopuler
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                        {post.category ? (
                          <span className="bg-secondary text-secondary-foreground font-medium px-2.5 py-1 rounded-md border border-border">
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="bg-transparent text-muted-foreground font-medium px-2.5 py-1 rounded-md border border-border/50">
                            Uncategorized
                          </span>
                        )}
                        <time className="font-medium">{formatDate(post.created_at)}</time>
                      </div>
                      <h3 className="font-bold text-foreground text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                        {post.excerpt
                          ? post.excerpt
                          : 'Simak pembahasan selengkapnya di artikel ini...'}
                      </p>
                      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform duration-300 inline-block">
                          Baca selengkapnya →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </section>
          )}

          {/* Pagination */}
          {(postsQuery.data?.meta?.total_pages ?? 0) > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mt-12 mb-4">
              <div className="text-sm text-muted-foreground flex items-center justify-center h-9">
                Halaman{' '}
                <span className="font-semibold text-foreground mx-1">
                  {postsQuery.data?.meta.page || page}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-foreground ml-1">
                  {postsQuery.data?.meta.total_pages || 1}
                </span>
              </div>
              <div className="flex gap-2 items-center bg-card border border-border p-1 rounded-lg">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-4 font-medium text-xs rounded-md"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Sebelumnya
                </Button>
                <div className="w-px h-4 bg-border mx-1"></div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-4 font-medium text-xs rounded-md"
                  disabled={page >= (postsQuery.data?.meta.total_pages ?? 1)}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, postsQuery.data?.meta.total_pages ?? 1))
                  }
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
