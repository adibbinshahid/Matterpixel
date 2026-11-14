import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { formatPostMeta, getAllPosts, getPostBySlug, slugifyHeading } from "@/lib/posts";
import { siteUrl } from "@/content/siteConfig";
import { DarkPage } from "@/components/DarkPage";
import { PageHero } from "@/components/PageHero";
import { InsightCard } from "@/components/InsightCard";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hl } from "@/components/home/Hl";

const mdxComponents = {
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2
      id={typeof children === "string" ? slugifyHeading(children) : undefined}
      className="mt-12 scroll-mt-28 text-2xl font-bold tracking-tight text-ink"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="mt-8 text-xl font-bold tracking-tight text-ink" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="mt-5 leading-relaxed text-ink-soft" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="mt-5 flex flex-col gap-3 pl-5 text-ink-soft [&>li]:list-disc" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="mt-5 flex flex-col gap-3 pl-5 text-ink-soft [&>li]:list-decimal" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => <li className="leading-relaxed" {...props} />,
  a: (props: React.ComponentProps<"a">) => (
    <a className="font-semibold text-blue underline-offset-4 hover:underline" {...props} />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-bold text-ink" {...props} />
  ),
  code: (props: React.ComponentProps<"code">) => (
    <code className="bg-paper-2 px-1.5 py-0.5 text-sm text-magenta" {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote className="mt-5 border-l-2 border-blue pl-5 italic text-ink-soft" {...props} />
  ),
};

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/insights/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getAllPosts().filter((p) => p.slug !== slug).slice(0, 2);
  const postUrl = `${siteUrl}/insights/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: postUrl,
    author: { "@type": "Organization", name: "Matterpixel" },
  };

  return (
    <DarkPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow={post.tag}
        lines={[post.title]}
        lede={formatPostMeta(post.date, post.readingTime)}
      >
        <Link
          href="/insights"
          className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-soft transition-colors duration-300 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1" />
          All insights
        </Link>
      </PageHero>

      <article className="pb-[72px] lg:pb-[120px]">
        <div className="home-shell">
          <div className="max-w-3xl">
            {post.toc.length > 1 && (
              <Reveal delay={0.05} className="rounded-[20px] border border-line bg-paper-2 p-6">
                <p className="label-eyebrow mb-3">On this page</p>
                <ul className="flex flex-col gap-2">
                  {post.toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-ink-soft transition-colors hover:text-[var(--blue-ink)]"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal delay={0.1} className="mt-12">
              <MDXRemote source={post.content} components={mdxComponents} />
            </Reveal>

            <Reveal delay={0.15} className="mt-14 flex flex-wrap items-center gap-4 border-t border-line pt-8">
              <span className="text-sm font-semibold text-ink-soft">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-fit text-sm font-semibold text-[var(--blue-ink)] underline-offset-4 hover:underline"
              >
                X / Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-fit text-sm font-semibold text-[var(--blue-ink)] underline-offset-4 hover:underline"
              >
                LinkedIn
              </a>
            </Reveal>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line py-[72px] lg:py-[120px]">
          <div className="home-shell">
            <Reveal>
              <p className="label-eyebrow mb-6">Related</p>
            </Reveal>
            <RevealGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {related.map((p) => (
                <RevealItem key={p.slug}>
                  <InsightCard
                    slug={p.slug}
                    tag={p.tag}
                    title={p.title}
                    excerpt={p.excerpt}
                    meta={formatPostMeta(p.date, p.readingTime)}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <ClosingCta
        eyebrow="Free audit"
        title={
          <>
            Got something that <Hl tone="magenta">matters</Hl>? Let&rsquo;s build it.
          </>
        }
      />
    </DarkPage>
  );
}
