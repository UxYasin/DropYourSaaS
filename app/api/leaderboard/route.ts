import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, getTrendingLeaderboard, getRecentSubmissions } from '@/lib/leaderboard';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || searchParams.get('sort');

  try {
    if (type === 'trending') {
      const items = await getTrendingLeaderboard();
      return NextResponse.json({ items });
    }

    if (type === 'recent') {
      const items = await getRecentSubmissions();
      return NextResponse.json({ items });
    }

    const items = await getLeaderboard();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}

