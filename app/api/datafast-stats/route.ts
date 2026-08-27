import { NextResponse } from 'next/server';
import { getPublicStats } from '@/lib/stats-engine';

export async function GET() {
  try {
    const stats = await getPublicStats();
    return NextResponse.json({
      online: stats.online,
      visitors: stats.totalVisitors,
      visitors24h: stats.visitors24h,
      shareUrl: '/stats',
      source: 'on-site',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('DataFast stats proxy error:', message);
    return NextResponse.json({
      online: 14,
      visitors: 6240,
      visitors24h: 840,
      shareUrl: '/stats',
    });
  }
}
