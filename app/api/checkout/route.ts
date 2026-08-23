import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { selectedUpsell } = body;

    // Return a checkout success or demo URL
    return NextResponse.json({
      success: true,
      message: 'Checkout initialized successfully',
      upsell: selectedUpsell,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 400 });
  }
}
