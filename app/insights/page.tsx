import type { Metadata } from "next";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { DarkPage } from "@/components/DarkPage";
import { PageHero } from "@/components/PageHero";
import { InsightCard } from "@/components/InsightCard";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hl } from "@/components/home/Hl";
import { formatPostMeta, getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Notes on performance, engineering, AI automation and AI-assisted brand production from the founder building Matterpixel.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const posts = getAllPosts();

  return (
    <DarkPage>
      <PageHero
        eyebrow="insights"
        lines={[
          <>
            Notes on building things
          </>,
          <>
            that <Hl tone="magenta">hold up</Hl>.
          </>,
        ]}
        lede="Performance, engineering, AI automation and AI visuals: what we've learned building them, written plainly."
      />

      <section className="pb-[72px] lg:pb-[120px]">
        <div className="home-shell">
          <RevealGroup className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <RevealItem key={post.slug}>
                <InsightCard
                  slug={post.slug}
                  tag={post.tag}
                  title={post.title}
                  excerpt={post.excerpt}
                  meta={formatPostMeta(post.date, post.readingTime)}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <ClosingCta />
    </DarkPage>
  );
}
