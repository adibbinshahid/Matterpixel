import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { DarkPage } from "@/components/DarkPage";
import { PageHero } from "@/components/PageHero";
import { nav } from "@/content/siteConfig";
import { mediums, projectsByMedium } from "@/content/projects";
import { services } from "@/content/services";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Every page on Matterpixel in one place — services, project case studies, insights, and the pages in between.",
  alternates: { canonical: "/sitemap" },
};

type Entry = { href: string; label: string; note?: string };
type Group = { title: string; entries: Entry[] };

/**
 * The human sitemap. Built from the same content modules the routes
 * themselves render from — `services`, `projects`, `getAllPosts()` — so a
 * new service or case study appears here the moment it exists, and this
 * page can never drift from the site the way a hand-written list would.
 *
 * The crawler's copy is still `/public/sitemap.xml` (declared in robots.txt);
 * that file is XML for machines and stays as it is. This is the readable one.
 */
function buildGroups(): Group[] {
  const posts = getAllPosts();

  return [
    {
      title: "Main",
      entries: [
        { href: "/", label: "Home", note: "Studio overview" },
        ...nav.links.map((l) => ({ href: l.href, label: l.label })),
      ],
    },
    {
      title: "Services",
      entries: services.map((s) => ({
        href: `/services/${s.slug}`,
        label: s.title,
        note: s.shortDesc,
      })),
    },
    // One block per medium, so the case studies read in the same lanes the
    // Projects page filters by rather than as one flat 12-item column.
    ...mediums.map((m) => ({
      title: m.label,
      entries: projectsByMedium(m.id).map((p) => ({
        href: `/projects/${p.slug}`,
        label: p.name,
        note: p.category,
      })),
    })),
    {
      title: "Insights",
      entries: posts.map((p) => ({
        href: `/insights/${p.slug}`,
        label: p.title,
        note: p.tag,
      })),
    },
  ].filter((g) => g.entries.length > 0);
}

export default function SitemapPage() {
  const groups = buildGroups();
  const total = groups.reduce((n, g) => n + g.entries.length, 0);

  return (
    <DarkPage>
      <PageHero
        eyebrow="sitemap"
        lines={["Every page, in one place."]}
        lede={
          <>
            {total} pages across services, case studies, and writing. Looking for the machine-readable
            version?{" "}
            <a
              href="/sitemap.xml"
              className="group inline-flex items-center gap-1 font-semibold text-[var(--blue-ink)] underline-offset-4 hover:underline"
            >
              sitemap.xml
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </>
        }
      />

      <section className="pb-[72px] lg:pb-[120px]">
        <div className="section-shell">
          <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <RevealItem key={group.title}>
                <div className="flex h-full flex-col rounded-[20px] border border-line bg-paper-2 p-8 transition-colors duration-300 hover:border-blue">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="label-eyebrow">{group.title}</span>
                    <span className="text-xs tabular-nums text-ink-soft">
                      {group.entries.length}
                    </span>
                  </div>

                  <ul className="mt-5 flex flex-col">
                    {group.entries.map((entry) => (
                      <li key={entry.href}>
                        <Link
                          href={entry.href}
                          // min-h-11 keeps every row at the iOS tap minimum;
                          // the list reads dense because the notes are small,
                          // not because the targets are.
                          className="group flex min-h-11 items-start gap-3 py-2"
                        >
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold text-ink transition-colors duration-300 group-hover:text-[var(--blue-ink)]">
                              {entry.label}
                            </span>
                            {entry.note ? (
                              <span className="line-clamp-1 text-xs text-ink-soft">
                                {entry.note}
                              </span>
                            ) : null}
                          </span>
                          <ChevronRight className="ml-auto mt-0.5 h-4 w-4 shrink-0 -translate-x-1 text-blue opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </DarkPage>
  );
}
