import { NextResponse } from 'next/server';
import { getPublicStats } from '@/lib/stats-engine';

export async function GET() {
  try {
    const stats = await getPublicStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Stats API error:', message);
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 });
  }
}
