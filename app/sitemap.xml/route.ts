import type { NextRequest } from "next/server";

export const dynamic = "force-static";

const urls = ["/", "/about", "/projects", "/experience", "/photos", "/contact"];

export function GET(_req: NextRequest) {
  const items = urls.map(u => `<url><loc>https://example.com${u}</loc></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
