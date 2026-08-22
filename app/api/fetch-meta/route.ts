import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl.replace(/^@/, '')}`;
  }

  let hostname = '';
  try {
    hostname = new URL(normalizedUrl).hostname;
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

  let title = hostname;
  let description = `Explore ${hostname} — verified software tools & developer services.`;
  let favicon = fallbackFavicon;
  let image: string | undefined;

  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; DropYourSaaSBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      const ogTitle = $('meta[property="og:title"]').attr('content');
      const metaTitle = $('title').text();
      title = (ogTitle || metaTitle || hostname).trim();

      const ogDesc = $('meta[property="og:description"]').attr('content');
      const metaDesc = $('meta[name="description"]').attr('content');
      description = (ogDesc || metaDesc || description).trim();

      const appleIcon = $('link[rel="apple-touch-icon"]').attr('href');
      const icon = $('link[rel="icon"]').attr('href');
      const extractedFavicon = appleIcon || icon;
      if (extractedFavicon) {
        try {
          favicon = new URL(extractedFavicon, normalizedUrl).toString();
        } catch {}
      }

      const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
      if (ogImage) {
        try {
          image = new URL(ogImage, normalizedUrl).toString();
        } catch {}
      }
    }
  } catch {
    // Fallback
  }

  return NextResponse.json({
    title,
    description,
    favicon,
    image,
  });
}