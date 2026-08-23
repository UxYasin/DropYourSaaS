import { NextResponse } from 'next/server';
import { leaderboardItems } from '@/lib/leaderboard-data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';

export async function GET() {
  return seedDatabase();
}

export async function POST() {
  return seedDatabase();
}

async function seedDatabase() {
  try {
    const supabase = getSupabaseServerClient();
    const seededCount = leaderboardItems.length;

    const entriesToInsert = leaderboardItems.map((item, index) => ({
      url: item.url,
      name: item.name,
      bid_cents: item.bid * 100,
      clicks: item.clicks || 0,
      status: 'published',
      is_verified: true,
      claimed_at: new Date(Date.now() - index * 15 * 60 * 1000).toISOString(),
    }));

    // Perform bulk upsert on leaderboard_entries
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .upsert(entriesToInsert, { onConflict: 'url' })
      .select('url, name');

    if (error) {
      console.error('Database seed error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await invalidateLeaderboardCache();

    return NextResponse.json({
      success: true,
      message: `Successfully seeded database with ${seededCount} listings!`,
      seeded: data || entriesToInsert,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}
