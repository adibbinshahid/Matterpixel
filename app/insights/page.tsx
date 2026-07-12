import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Notes on performance, engineering, and AI-assisted brand production from the team building Matterpixel.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const posts = getAllPosts();

  return (
    <section className="px-6 py-32 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="label-eyebrow mb-4">insights</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Notes on building things that hold up.
          </h1>
        </Reveal>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <RevealItem key={post.slug}>
              <Link
                href={`/insights/${post.slug}`}
                className="group flex h-full flex-col justify-between border border-line bg-paper-2 p-8 transition-all duration-300 hover:scale-[1.02] hover:border-blue"
              >
                <div>
                  <span className="label-eyebrow">{post.tag}</span>
                  <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight text-ink">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-ink-soft">
                  <span>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {post.readingTime}
                  </span>
                  <ArrowRight className="h-4 w-4 text-blue transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
