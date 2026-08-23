declare module '@paddle/paddle-js' {
  export interface PricePreviewParams {
    items: Array<{ priceId: string; quantity: number }>;
    address?: { countryCode?: string };
  }

  export interface PricePreviewResponse {
    data: {
      details: {
        lineItems: Array<{
          price: { id: string };
          formattedTotals?: { total: string };
          totals?: { total: number };
        }>;
      };
    };
  }

  export interface CheckoutOpenParams {
    settings?: {
      displayMode?: 'overlay' | 'inline';
      variant?: 'one-page' | 'multi-page';
      successUrl?: string;
      theme?: 'light' | 'dark' | 'system';
    };
    items?: Array<{ priceId: string; quantity: number }>;
    customData?: Record<string, any>;
    customer?: { email?: string; id?: string };
  }

  export interface Paddle {
    Initialized: boolean;
    PricePreview(params: PricePreviewParams): Promise<PricePreviewResponse>;
    Checkout: {
      open(params: CheckoutOpenParams): void;
      updateItems(items: Array<{ priceId: string; quantity: number }>): void;
    };
  }

  export interface InitializePaddleOptions {
    token: string;
    environment?: 'sandbox' | 'production';
    eventCallback?: (event: { name: string; data?: any }) => void;
    checkout?: {
      settings?: any;
    };
  }

  export function initializePaddle(options: InitializePaddleOptions): Promise<Paddle | undefined>;
}
