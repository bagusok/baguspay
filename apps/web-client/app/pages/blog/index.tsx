import { Link } from "react-router";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  tag: string;
};

const posts: Post[] = Array.from({ length: 9 }).map((_, i) => ({
  slug: `dummy-post-${i + 1}`,
  title: `Tips Topup Hemat #${i + 1}`,
  excerpt:
    "Pelajari cara mendapatkan harga terbaik saat topup game & PPOB di Baguspay.",
  image: `https://picsum.photos/seed/baguspay-${i}/600/400`,
  date: new Date(Date.now() - i * 86400000).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  tag: i % 2 === 0 ? "Topup" : "PPOB",
}));

export default function Blog() {
  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            Wawasan & Tips
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Blog Baguspay
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Artikel ringan seputar topup game, PPOB, promo, dan update fitur.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Grid */}
      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {posts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
            <article className="overflow-hidden rounded-xl border border-border bg-card h-full flex flex-col">
              <div className="overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="bg-secondary px-2 py-0.5 rounded-full border border-border">
                    {post.tag}
                  </span>
                  <time>{post.date}</time>
                </div>
                <h3 className="mt-2 font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <span className="mt-3 text-sm font-medium text-primary">
                  Baca selengkapnya →
                </span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
