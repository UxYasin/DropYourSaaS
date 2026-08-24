import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  return session === 'authenticated';
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { site_url, project_name, one_liner, logo_url, slot_position, duration_days = 30, contact_email } = body;

    if (!site_url || !project_name || !one_liner || !slot_position) {
      return NextResponse.json(
        { error: 'Missing required fields: site_url, project_name, one_liner, and slot_position are required.' },
        { status: 400 }
      );
    }

    const durationDaysNum = Number(duration_days) || 30;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + durationDaysNum * 24 * 60 * 60 * 1000);

    const supabase = getSupabaseServerClient();

    // Upsert pinned ad locked to unique slot_position
    const { data, error } = await supabase
      .from('pinned_ads')
      .upsert(
        {
          slot_position: slot_position.trim(),
          site_url: site_url.trim(),
          project_name: project_name.trim(),
          one_liner: one_liner.trim(),
          logo_url: logo_url ? logo_url.trim() : null,
          contact_email: contact_email ? contact_email.trim() : null,
          duration_days: durationDaysNum,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
        },
        { onConflict: 'slot_position' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error publishing pinned ad:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pinnedAd: data });
  } catch (err: any) {
    console.error('Place ad API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slot_position = searchParams.get('slot_position');

    const supabase = getSupabaseServerClient();

    let query = supabase.from('pinned_ads').delete();
    if (id) {
      query = query.eq('id', id);
    } else if (slot_position) {
      query = query.eq('slot_position', slot_position);
    } else {
      return NextResponse.json({ error: 'Missing id or slot_position' }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('pinned_ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pinnedAds: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
