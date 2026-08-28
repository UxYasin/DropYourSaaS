import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const supabase = getSupabaseServerClient();
    let query = supabase
      .from('leaderboard_entries')
      .select('*')
      .order('bid_cents', { ascending: false, nullsFirst: false })
      .order('net_score', { ascending: false, nullsFirst: false })
      .order('claimed_at', { ascending: false, nullsFirst: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,url.ilike.%${search}%,category.ilike.%${search}%,submitter_email.ilike.%${search}%`);
    }

    const { data: listings, error } = await query;
    if (error) throw error;

    return NextResponse.json({ listings: listings || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin listings GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      url,
      description,
      category = 'SaaS',
      bidAmount = 0,
      is_verified = true,
      is_dofollow = true,
      status = 'published',
      twitter_handle,
      favicon_url,
      preview_image_url,
      submitter_email,
      is_for_sale = false,
      asking_price = 0,
      mrr = 0,
    } = body;

    if (!url || !name) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    const normalizedUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    const bidCents = Math.round(Number(bidAmount || 0) * 100);
    const nowIso = new Date().toISOString();

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .upsert(
        {
          name: name.trim(),
          url: normalizedUrl,
          description: description || undefined,
          value_proposition: description || undefined,
          category: category.trim() || 'SaaS',
          bid_cents: bidCents,
          is_verified: Boolean(is_verified),
          is_dofollow: Boolean(is_dofollow),
          status: status || 'published',
          twitter_handle: twitter_handle ? twitter_handle.replace(/^@/, '').trim() : undefined,
          favicon_url: favicon_url || undefined,
          preview_image_url: preview_image_url || undefined,
          submitter_email: submitter_email || undefined,
          is_for_sale: Boolean(is_for_sale),
          for_sale: Boolean(is_for_sale),
          asking_price: Number(asking_price || 0),
          mrr: Number(mrr || 0),
          claimed_at: nowIso,
          verified_at: is_verified ? nowIso : undefined,
        },
        { onConflict: 'url' }
      )
      .select()
      .single();

    if (error) throw error;

    await invalidateLeaderboardCache();

    return NextResponse.json({ success: true, listing: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin listings POST error:', message);
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
    const { id, updates } = body;

    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'ID and updates object are required' }, { status: 400 });
    }

    // Process specific fields
    const sanitizedUpdates: Record<string, unknown> = { ...updates };

    if ('bid' in sanitizedUpdates) {
      sanitizedUpdates.bid_cents = Math.round(Number(sanitizedUpdates.bid || 0) * 100);
      delete sanitizedUpdates.bid;
    }

    if ('is_for_sale' in sanitizedUpdates) {
      sanitizedUpdates.for_sale = Boolean(sanitizedUpdates.is_for_sale);
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await invalidateLeaderboardCache();

    return NextResponse.json({ success: true, listing: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin listings PATCH error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await invalidateLeaderboardCache();

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Admin listings DELETE error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
