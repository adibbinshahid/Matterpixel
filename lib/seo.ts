import type { Metadata } from "next";
import { brand, siteUrl } from "@/content/siteConfig";

/**
 * One place that builds a page's metadata. Next replaces (never merges) a
 * parent's `openGraph` / `twitter` objects when a page sets its own, so a
 * page that only set `title` used to share the homepage's preview title,
 * URL and image. Every page goes through here so each share preview names
 * the page it links to.
 */

const SITE_NAME = "Matterpixel";

/** Absolute URL for a path on this site ("/about" → "https://…/about"). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path === "/" ? "" : path}`;
}

/** The generated 1200×630 card, titled for this page. */
export function ogImageUrl(title?: string, eyebrow?: string): string {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (eyebrow) params.set("eyebrow", eyebrow);
  const query = params.toString();
  return `/api/og${query ? `?${query}` : ""}`;
}

type PageMetaInput = {
  /** Short page title; the layout template appends "— Matterpixel". */
  title: string;
  description: string;
  path: string;
  /** Use `title` verbatim, skipping the layout template (homepage). */
  absoluteTitle?: boolean;
  /** A real image for the preview; defaults to the generated card. */
  image?: string;
  /** Small label on the generated card ("Case study", "Service"). */
  eyebrow?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  image,
  eyebrow,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex,
}: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} — ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const images = [
    image
      ? { url: image, alt: title }
      : { url: ogImageUrl(title, eyebrow), width: 1200, height: 630, alt: title },
  ];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      images,
      ...(type === "article" && publishedTime
        ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime, authors: [brand.founder] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((i) => i.url),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** BreadcrumbList for a detail page: Home → section → page. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
