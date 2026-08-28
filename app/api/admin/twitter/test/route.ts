import { NextResponse } from 'next/server';
import { postToX } from '@/lib/twitter';
import { cookies } from 'next/headers';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  return session === 'authenticated';
}

export async function GET() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const isConfigured = Boolean(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_SECRET
  );

  return NextResponse.json({
    configured: isConfigured,
    hasApiKey: Boolean(process.env.TWITTER_API_KEY),
    hasApiSecret: Boolean(process.env.TWITTER_API_SECRET),
    hasAccessToken: Boolean(process.env.TWITTER_ACCESS_TOKEN),
    hasAccessSecret: Boolean(process.env.TWITTER_ACCESS_SECRET),
  });
}

export async function POST(req: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { projectName = 'Admin Test Product', siteUrl = 'https://www.dropyoursaas.com', tagline = 'Testing X Twitter Auto-Poster' } = body;

    const result = await postToX(projectName, siteUrl, tagline, true);
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Twitter test error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
