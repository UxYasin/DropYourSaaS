import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, customData, productId: reqProductId } = body;
    const productId = reqProductId || process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID;

    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      console.error('CREEM_API_KEY is not configured');
      return NextResponse.json({ error: 'Creem API key is not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        customer: email ? { email } : undefined,
        metadata: customData || undefined,
      }),
    });

    const data = await response.json();

    if (data.checkout_url || data.url) {
      return NextResponse.json({ url: data.checkout_url || data.url });
    } else {
      console.error('Creem checkout creation error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to create checkout' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
