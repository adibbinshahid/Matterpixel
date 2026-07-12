import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getAllPosts, getPostBySlug, slugifyHeading } from "@/lib/posts";
import { siteUrl } from "@/content/siteConfig";

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="px-6 pb-16 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Link
              href="/insights"
              className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-soft transition-all duration-300 hover:scale-105 hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              All insights
            </Link>

            <p className="label-eyebrow mb-4 mt-8">{post.tag}</p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              {post.title}
            </h1>
            <div className="mt-4 text-sm text-ink-soft">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {post.readingTime}
            </div>
          </Reveal>

          {post.toc.length > 1 && (
            <Reveal delay={0.05} className="mt-10 border border-line bg-paper-2 p-6">
              <p className="label-eyebrow mb-3">On this page</p>
              <ul className="flex flex-col gap-2">
                {post.toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-ink-soft transition-colors hover:text-blue"
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
              className="inline-block w-fit origin-left text-sm font-semibold text-blue transition-transform duration-300 hover:scale-105 hover:underline"
            >
              X / Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-fit origin-left text-sm font-semibold text-blue transition-transform duration-300 hover:scale-105 hover:underline"
            >
              LinkedIn
            </a>
          </Reveal>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper-2 px-6 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <Reveal>
              <p className="label-eyebrow mb-6">Related</p>
            </Reveal>
            <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {related.map((p) => (
                <RevealItem key={p.slug}>
                  <Link
                    href={`/insights/${p.slug}`}
                    className="group block border border-line bg-paper p-8 transition-all duration-300 hover:scale-[1.02] hover:border-blue"
                  >
                    <span className="label-eyebrow">{p.tag}</span>
                    <h3 className="mt-3 text-lg font-bold tracking-tight text-ink">{p.title}</h3>
                    <p className="mt-2 text-sm text-ink-soft">{p.excerpt}</p>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              Got something that matters? Let&rsquo;s build it.
            </h2>
            <Link
              href="/contact"
              className="font-avenir group mt-8 inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-7 py-4 text-sm text-paper transition-transform duration-300 hover:scale-105 animate-gradient-shift"
            >
              Start a Project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
