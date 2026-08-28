import { WhopClient } from '@whop/sdk';
import { unwrapWebhook } from '@whop/sdk/helpers';

let cachedWhopClient: WhopClient | null = null;

export function getWhopClient(): WhopClient | null {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    console.warn('[Whop SDK] WHOP_API_KEY is not configured in environment.');
    return null;
  }
  if (!cachedWhopClient) {
    cachedWhopClient = new WhopClient({
      token: apiKey,
    });
  }
  return cachedWhopClient;
}

export interface CreateRankCheckoutParams {
  amount: number;
  targetRank?: number;
  listingId?: string;
  siteUrl: string;
  projectName?: string;
  oneLiner?: string;
  email?: string;
  tier?: string;
  slotPosition?: string;
  twitterHandle?: string;
  logoUrl?: string;
  category?: string;
  redirectUrl?: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl: string;
  sessionId?: string;
  planId?: string;
  error?: string;
}

/**
 * Creates a dynamic direct Whop Checkout session for purchasing a high rank, outbidding, or booking a rail ad.
 * Directly produces the native Whop checkout screen (Apple Pay, Google Pay, Card, Crypto) for the exact amount.
 */
export async function createWhopRankCheckout(params: CreateRankCheckoutParams): Promise<CheckoutResult> {
  const {
    amount,
    targetRank = 1,
    listingId = '',
    siteUrl,
    projectName = 'SaaS Project',
    oneLiner = '',
    email,
    tier = 'paid_rank',
    slotPosition = '',
    twitterHandle = '',
    logoUrl = '',
    category = 'SaaS',
    redirectUrl,
  } = params;

  let siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dropyoursaas.com';
  if (process.env.NODE_ENV === 'production' && siteBaseUrl.includes('localhost')) {
    siteBaseUrl = 'https://www.dropyoursaas.com';
  }
  const defaultRedirect = redirectUrl || `${siteBaseUrl}/congrats?name=${encodeURIComponent(projectName)}&url=${encodeURIComponent(siteUrl)}&rank=${targetRank}&verified=true`;

  const client = getWhopClient();
  const exactAmount = Math.max(1, Number(amount || 1));

  // 1. Direct Whop SDK dynamic Checkout Configuration
  if (client) {
    try {
      const checkout = await client.checkoutConfigurations.create({
        plan: {
          initial_price: exactAmount,
          plan_type: 'one_time',
          currency: 'usd',
        },
        metadata: {
          listing_id: String(listingId || ''),
          target_rank: String(targetRank),
          requested_rank: String(targetRank),
          site_url: String(siteUrl),
          project_name: String(projectName),
          one_liner: String(oneLiner),
          email: email ? String(email).trim() : '',
          tier: String(tier),
          slot_position: String(slotPosition),
          twitter_handle: String(twitterHandle),
          logo_url: String(logoUrl),
          category: String(category),
        },
        redirect_url: defaultRedirect,
      });

      const purchaseUrl = checkout.purchase_url;
      if (purchaseUrl) {
        return {
          success: true,
          checkoutUrl: purchaseUrl,
          sessionId: checkout.id,
          planId: checkout.plan?.id,
        };
      }
    } catch (sdkError: unknown) {
      const msg = sdkError instanceof Error ? sdkError.message : String(sdkError);
      console.error('[Whop SDK] Error creating checkout configuration via SDK:', msg);
      return {
        success: false,
        checkoutUrl: '',
        error: `Whop checkout error: ${msg}`,
      };
    }
  }

  return {
    success: false,
    checkoutUrl: '',
    error: 'Whop API key is not configured on the server.',
  };
}

/**
 * Verifies Whop Webhook signature using @whop/sdk helpers unwrapWebhook.
 */
export function verifyWhopWebhookEvent(rawPayload: string, headers: Record<string, string | string[] | undefined>) {
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('WHOP_WEBHOOK_SECRET is not configured.');
  }

  // Normalize header entries to string values
  const stringHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      stringHeaders[key.toLowerCase()] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      stringHeaders[key.toLowerCase()] = value[0];
    }
  }

  return unwrapWebhook(rawPayload, { headers: stringHeaders, key: webhookSecret });
}
