// app/robots.txt/route.ts — DROP-IN REPLACEMENT
import type { NextRequest } from "next/server";

export const dynamic = "force-static";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

export function GET(_req: NextRequest) {
  const body = `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
