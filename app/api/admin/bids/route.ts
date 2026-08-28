import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  return session === 'authenticated';
}

export async function GET(request: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const supabase = getSupabaseServerClient();
    let query = supabase
      .from('bids')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: bids, error } = await query;
    if (error) throw error;

    const allBids = bids || [];

    // Calculate revenue telemetry
    const totalGrossCents = allBids
      .filter((b) => b.status === 'paid')
      .reduce((acc, curr) => acc + Number(curr.amount_cents || 0), 0);

    const paidCount = allBids.filter((b) => b.status === 'paid').length;
    const pendingCount = allBids.filter((b) => b.status === 'pending').length;
    const failedCount = allBids.filter((b) => b.status === 'failed').length;

    return NextResponse.json({
      bids: allBids,
      stats: {
        totalGrossUsd: totalGrossCents / 100,
        paidCount,
        pendingCount,
        failedCount,
        totalOrders: allBids.length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin bids GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('bids')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, bid: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin bids PATCH error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
