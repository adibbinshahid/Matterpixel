/**
 * Generates public/sitemap.xml and public/robots.txt from content/.
 *
 * Why a script instead of app/sitemap.ts / app/robots.ts: this repo's
 * absolute path contains an apostrophe, which corrupts Next's
 * next-metadata-route-loader codegen (it emits a JS string literal with
 * the raw path inside, and the unescaped `'` breaks the generated module).
 * That's an upstream Next.js bug, not something fixable from userland —
 * so the dynamic-route-handler convention for sitemap/robots is a
 * hard no-op in this specific directory. A build-time-generated static
 * file sidesteps the loader entirely while staying auto-derived from the
 * same content/ source of truth. Runs via `prebuild` in package.json.
 */
import fs from "node:fs";
import path from "node:path";
import { projects } from "../content/projects";
import { services } from "../content/services";
import { getAllPosts } from "../lib/posts";
import { siteUrl } from "../content/siteConfig";

const PUBLIC_DIR = path.join(process.cwd(), "public");

type UrlEntry = { loc: string; changefreq: string; priority: string; lastmod?: string };

function buildUrls(): UrlEntry[] {
  const staticRoutes: UrlEntry[] = [
    { loc: "", changefreq: "monthly", priority: "1.0" },
    { loc: "/work", changefreq: "monthly", priority: "0.8" },
    { loc: "/services", changefreq: "monthly", priority: "0.8" },
    { loc: "/about", changefreq: "monthly", priority: "0.8" },
    { loc: "/insights", changefreq: "weekly", priority: "0.8" },
    { loc: "/contact", changefreq: "monthly", priority: "0.8" },
  ];

  const projectRoutes: UrlEntry[] = projects.map((p) => ({
    loc: `/work/${p.slug}`,
    changefreq: "monthly",
    priority: "0.7",
  }));

  const serviceRoutes: UrlEntry[] = services.map((s) => ({
    loc: `/services/${s.slug}`,
    changefreq: "monthly",
    priority: "0.7",
  }));

  const postRoutes: UrlEntry[] = getAllPosts().map((p) => ({
    loc: `/insights/${p.slug}`,
    changefreq: "yearly",
    priority: "0.5",
    lastmod: p.date,
  }));

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...postRoutes];
}

function toXml(urls: UrlEntry[]): string {
  const items = urls
    .map(
      (u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

const urls = buildUrls();
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), toXml(urls));
fs.writeFileSync(
  path.join(PUBLIC_DIR, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

console.log(`Generated sitemap.xml with ${urls.length} URLs and robots.txt`);
