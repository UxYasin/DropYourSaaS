import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { site_url, project_name, one_liner, contact_email } = body;

    if (!site_url || !project_name || !one_liner || !contact_email) {
      return NextResponse.json(
        { error: 'Missing required fields: site_url, project_name, one_liner, and contact_email are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('ad_requests')
      .insert({
        site_url: site_url.trim(),
        project_name: project_name.trim(),
        one_liner: one_liner.trim(),
        contact_email: contact_email.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting ad request:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to record ad request in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, adRequest: data });
  } catch (err: any) {
    console.error('Ad request API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
