import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawIdentifier = String(body.email || body.username || body.userId || '').trim().toLowerCase();
    const rawPassword = String(body.password || '').trim();

    const validIdentifiers = [
      'loladmin',
      'loladmin@dropyoursaas.com',
      'learnwithyasin@gmail.com',
      'admin',
      'admin@dropyoursaas.com',
      (process.env.ADMIN_EMAIL || '').toLowerCase(),
    ].filter(Boolean);

    const validPasswords = [
      'YA$in78691',
      'YA$in7869',
      process.env.ADMIN_PASS,
    ].filter(Boolean);

    const isIdentifierValid = validIdentifiers.includes(rawIdentifier);
    const isPasswordValid = validPasswords.includes(rawPassword);

    if (isIdentifierValid && isPasswordValid) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Server error' }, { status: 500 });
  }
}
