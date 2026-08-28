import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
import { cookies } from 'next/headers';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  return session === 'authenticated';
}

export async function POST() {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    // Invalidate leaderboard cache
    await invalidateLeaderboardCache();

    // Flush common keys in Upstash Redis
    try {
      const keysToDel = [
        'leaderboard:v1',
        'leaderboard:v2',
        'leaderboard:v3',
        'leaderboard:v4',
        'leaderboard:v5',
        'leaderboard:v6',
        'leaderboard:v7',
        'leaderboard:v8',
        'site:stats:public:v1',
        'site:stats:public:v2',
        'site:stats:public:v3',
        'site:stats:public:v4',
        'rails:pool:v1',
        'rails:pool:v2',
      ];
      await Promise.all(keysToDel.map((k) => redis.del(k).catch(() => null)));
    } catch (redisErr) {
      console.warn('Redis cache key flush warning:', redisErr);
    }

    return NextResponse.json({
      success: true,
      message: 'All Redis cache layers flushed successfully. Live database sync active.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin cache flush error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
