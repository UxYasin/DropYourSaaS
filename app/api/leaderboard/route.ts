import { NextRequest, NextResponse } from 'next/server';
import {
  getLeaderboard,
  getPaginatedLeaderboard,
  getTrendingLeaderboard,
  getRecentSubmissions,
} from '@/lib/leaderboard';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || searchParams.get('sort');
  const category = searchParams.get('category') || undefined;
  const sortByParam = searchParams.get('sortBy') as 'rank' | 'hot' | 'top' | 'recent' | null;
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '50', 10);

  const sortBy = ['rank', 'hot', 'top', 'recent'].includes(sortByParam || '')
    ? (sortByParam as 'rank' | 'hot' | 'top' | 'recent')
    : 'rank';
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = isNaN(limitParam) || limitParam < 1 ? 50 : limitParam;

  try {
    if (type === 'trending') {
      const items = await getTrendingLeaderboard();
      return NextResponse.json({ items });
    }

    if (type === 'recent') {
      const items = await getRecentSubmissions();
      return NextResponse.json({ items });
    }

    const result = await getPaginatedLeaderboard(page, limit, category, sortBy);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Leaderboard fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
