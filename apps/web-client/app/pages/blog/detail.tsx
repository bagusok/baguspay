import { isAxiosError } from 'axios'
import { Facebook, Link as LinkIcon, MessageCircle, Send, Share2, Twitter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { data, Link, useParams } from 'react-router'
import { apiClient } from '~/utils/axios'
import type { Route } from './+types'

export async function loader(args: Route.LoaderArgs) {
  try {
    const params = args.params as Record<string, string | undefined>
    const { category, slug } = params

    const response = await apiClient.get(`/blog/posts/${category}/${slug}`).catch((err) => {
      throw new Error(err.response?.data?.message || 'Gagal memuat data')
    })
    return data({
      success: true,
      data: response.data,
    })
  } catch (error) {
    if (isAxiosError(error)) {
      return data({
        success: false,
        message: error.response?.data?.message || 'Gagal memuat data',
      })
    }
    return data({
      success: false,
      message: 'Gagal memuat data',
    })
  }
}

export default function BlogDetail({ loaderData }: Route.ComponentProps) {
  const routeData = loaderData as unknown as { success: boolean; data?: any; message?: string }
  const success = routeData?.success
  const post = success ? routeData?.data?.data : null

  const params = useParams<{ slug: string }>()
  const slug = params.slug ?? 'dummy-post'
  const title =
    post?.title ||
    slug
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ')

  const contentRef = useRef<HTMLDivElement | null>(null)
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([])
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [readingTime, setReadingTime] = useState<number>(0)

  useEffect(() => {
    if (typeof window !== 'undefined') setCurrentUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (!contentRef.current) return
    const container = contentRef.current

    if (!post?.content) {
      container.innerHTML = ''
      setToc([])
      setReadingTime(0)
      return
    }

    // Hydrate HTML content from server
    container.innerHTML = post.content

    // Process content to make images responsive if they aren't already
    const images = container.querySelectorAll('img')
    images.forEach((img) => {
      if (!img.className.includes('w-full') && !img.className.includes('max-w-full')) {
        img.className += ' max-w-full h-auto rounded-lg mx-auto object-cover'
      }
    })

    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>('h2, h3'))
    const items: Array<{ id: string; text: string; level: number }> = []
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    headings.forEach((h) => {
      const text = h.textContent ?? ''
      if (!text) return
      const id = h.id || slugify(text)
      h.id = id
      items.push({ id, text, level: h.tagName === 'H2' ? 2 : 3 })
    })
    setToc(items)

    const words = (container.innerText || '').trim().split(/\s+/).length
    setReadingTime(Math.max(1, Math.round(words / 200)))
  }, [post?.content])

  if (!success || !post) {
    return (
      <div className="md:max-w-4xl mx-auto text-center space-y-4 py-10">
        <p className="text-lg font-semibold text-foreground">
          {routeData?.message || 'Artikel tidak ditemukan.'}
        </p>
        <p className="text-muted-foreground">
          Silakan kembali ke halaman blog untuk melihat artikel lain.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Kembali ke Blog
        </Link>
      </div>
    )
  }

  return (
    <div className="md:max-w-7xl mx-auto">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/blog" className="hover:underline">
          Blog
        </Link>{' '}
        / <span className="text-foreground/80">{title}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dipublikasikan pada{' '}
        {new Date(post?.created_at || post?.published_at || Date.now()).toLocaleDateString(
          'id-ID',
          {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          },
        )}
        {readingTime ? ` • ${readingTime} menit baca` : null}
      </p>

      <SocialShare title={title} url={currentUrl} />
      {post?.image_url ? (
        <img
          src={post.image_url}
          alt={title}
          className="mt-6 w-full h-auto rounded-xl object-cover max-h-125"
        />
      ) : null}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          <div
            ref={contentRef}
            className="prose dark:prose-invert prose-sm md:prose-base max-w-none"
          >
            {!post?.content ? <p>Konten tidak tersedia.</p> : null}
          </div>
        </div>
        <aside className="lg:col-span-3">
          <TableOfContents items={toc} />
        </aside>
      </div>
    </div>
  )
}

function SocialShare({ title, url }: { title: string; url: string }) {
  const shareUrl = encodeURIComponent(url || '')
  const text = encodeURIComponent(title)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else if (typeof window !== 'undefined') {
        const ta = document.createElement('textarea')
        ta.value = url
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

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
        <LinkIcon className="size-4" /> {copied ? 'Tersalin' : 'Salin'}
      </button>
    </div>
  )
}

function TableOfContents({ items }: { items: Array<{ id: string; text: string; level: number }> }) {
  if (!items?.length) return null
  return (
    <div className="rounded-lg border bg-card p-4 sticky top-24">
      <p className="text-sm font-semibold mb-2">Daftar Isi</p>
      <nav className="text-sm space-y-1">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`block hover:underline text-muted-foreground ${it.level === 3 ? 'pl-4' : 'pl-0'}`}
          >
            {it.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
