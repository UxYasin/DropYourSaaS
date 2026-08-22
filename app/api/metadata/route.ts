import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

function normalizeUrl(input: string): string {
  let cleaned = input.trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned.replace(/^@/, '')}`;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.toString();
  } catch {
    return cleaned;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const normalizedUrl = normalizeUrl(rawUrl);
    let hostname = '';
    try {
      hostname = new URL(normalizedUrl).hostname;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 });
    }

    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    const fallbackScreenshot = `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&meta=false&embed=screenshot.url`;

    let title = hostname;
    let description = '';
    let favicon = fallbackFavicon;
    let screenshotUrl = fallbackScreenshot;

    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; DropYourSaaSBot/1.0)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);

        // Title extraction
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const twitterTitle = $('meta[name="twitter:title"]').attr('content');
        const metaTitle = $('title').text();
        title = (ogTitle || twitterTitle || metaTitle || hostname).trim();

        // Description extraction
        const ogDesc = $('meta[property="og:description"]').attr('content');
        const metaDesc = $('meta[name="description"]').attr('content');
        const twitterDesc = $('meta[name="twitter:description"]').attr('content');
        description = (ogDesc || metaDesc || twitterDesc || '').trim();

        // Favicon extraction
        const appleIcon = $('link[rel="apple-touch-icon"]').attr('href');
        const icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
        const extractedFavicon = appleIcon || icon;

        if (extractedFavicon) {
          try {
            favicon = new URL(extractedFavicon, normalizedUrl).toString();
          } catch {
            favicon = fallbackFavicon;
          }
        }

        // Image / Screenshot extraction
        const ogImage = $('meta[property="og:image"]').attr('content');
        const twitterImage = $('meta[name="twitter:image"]').attr('content');
        const extractedImage = ogImage || twitterImage;

        if (extractedImage) {
          try {
            screenshotUrl = new URL(extractedImage, normalizedUrl).toString();
          } catch {
            screenshotUrl = fallbackScreenshot;
          }
        }
      }
    } catch {
      // Graceful fallback to default values
    }

    return NextResponse.json({
      success: true,
      data: {
        title,
        description,
        favicon,
        screenshotUrl,
        url: normalizedUrl,
        hostname,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Scraping failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
  }

  const normalizedUrl = normalizeUrl(rawUrl);
  let hostname = '';
  try {
    hostname = new URL(normalizedUrl).hostname;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 });
  }

  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  const fallbackScreenshot = `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&meta=false&embed=screenshot.url`;

  return NextResponse.json({
    success: true,
    data: {
      title: hostname,
      description: '',
      favicon: fallbackFavicon,
      screenshotUrl: fallbackScreenshot,
      url: normalizedUrl,
      hostname,
    },
  });
}
