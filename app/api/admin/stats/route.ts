import { NextResponse } from 'next/server';
import { getAdminStats, simulateOrganicListingClicks } from '@/lib/stats-engine';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value;

    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    // Run organic click simulation tick on admin query
    await simulateOrganicListingClicks();

    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin stats error:', message);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value;

    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    await simulateOrganicListingClicks();
    const stats = await getAdminStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
