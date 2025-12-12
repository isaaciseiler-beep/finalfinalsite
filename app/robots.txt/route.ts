import type { NextRequest } from "next/server";

export const dynamic = "force-static";

export function GET(_req: NextRequest) {
  const body = `User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
