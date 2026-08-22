import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.DATAFAST_API_KEY;
  const websiteId = process.env.DATAFAST_WEBSITE_ID || process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID || 'dfid_pCMXrGVLqim1H2RKI6SAv';
  const shareUrl = 'https://datafa.st/share/6a89fc95a1f790d0fcd8c797';

  let online: number | null = null;
  let visitors: number | null = null;
  let isLive = false;

  // 1. Fetch live data if API Key is configured
  if (apiKey) {
    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      const isAccountToken = apiKey.startsWith('dft_');
      const queryParam = isAccountToken ? `?websiteId=${encodeURIComponent(websiteId)}` : '';
      const queryParamWithRange = isAccountToken 
        ? `?websiteId=${encodeURIComponent(websiteId)}&range=all` 
        : `?range=all`;

      // Query Realtime API: count of active visitors in last 10 mins
      const realtimePromise = fetch(`https://datafa.st/api/v1/analytics/realtime${queryParam}`, {
        headers,
        cache: 'no-store',
      })
        .then(async (res) => (res.ok ? res.json() : null))
        .catch(() => null);

      // Query Overview API: lifetime / all-time visitors
      const overviewPromise = fetch(`https://datafa.st/api/v1/analytics/overview${queryParamWithRange}`, {
        headers,
        cache: 'no-store',
      })
        .then(async (res) => (res.ok ? res.json() : null))
        .catch(() => null);

      const [realtimeData, overviewData] = await Promise.all([realtimePromise, overviewPromise]);

      if (realtimeData) {
        if (Array.isArray(realtimeData?.data) && typeof realtimeData.data[0]?.visitors === 'number') {
          online = realtimeData.data[0].visitors;
          isLive = true;
        } else if (typeof realtimeData?.data?.visitors === 'number') {
          online = realtimeData.data.visitors;
          isLive = true;
        } else if (typeof realtimeData?.visitors === 'number') {
          online = realtimeData.visitors;
          isLive = true;
        }
      }

      if (overviewData) {
        if (Array.isArray(overviewData?.data) && typeof overviewData.data[0]?.visitors === 'number') {
          visitors = overviewData.data[0].visitors;
          isLive = true;
        } else if (typeof overviewData?.data?.visitors === 'number') {
          visitors = overviewData.data.visitors;
          isLive = true;
        } else if (typeof overviewData?.data?.totalVisitors === 'number') {
          visitors = overviewData.data.totalVisitors;
          isLive = true;
        } else if (typeof overviewData?.visitors === 'number') {
          visitors = overviewData.visitors;
          isLive = true;
        }
      }
    } catch {
      // Ignore and fallback below
    }
  }

  // If API returned real data or key is unset, ensure clean real numbers
  return NextResponse.json({
    online: online ?? 0,
    visitors: visitors ?? 0,
    shareUrl,
    isLive,
  });
}
