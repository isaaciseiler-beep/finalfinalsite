// app/sitemap.xml/route.ts — DROP-IN REPLACEMENT
import type { NextRequest } from "next/server";

export const dynamic = "force-static";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

const urls = ["/", "/about", "/projects", "/experience", "/photos", "/contact", "/blog"];

export function GET(_req: NextRequest) {
  const now = new Date().toISOString();

  const items = urls
    .map(
      (u) =>
        `<url><loc>${SITE_URL}${u}</loc><lastmod>${now}</lastmod></url>`
    )
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    items +
    `</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
