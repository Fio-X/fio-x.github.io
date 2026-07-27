import { SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
