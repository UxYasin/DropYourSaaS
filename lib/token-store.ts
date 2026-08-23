// Shared in-memory token fallback store for zero-failure verification.
// Preserves pending listings in memory if database connection or keys are unconfigured.

export interface PendingListing {
  token: string;
  url: string;
  name: string;
  email: string;
  category: string;
  isForSale: boolean;
  askingPrice?: number;
  mrr?: number;
  ttmRevenue?: number;
  bid: number;
  createdAt: string;
}

// Global object to persist memory store across hot-reloads in Next.js
const globalForTokens = globalThis as unknown as {
  pendingListingsStore?: Map<string, PendingListing>;
};

export const pendingListingsStore =
  globalForTokens.pendingListingsStore || new Map<string, PendingListing>();

if (process.env.NODE_ENV !== 'production') {
  globalForTokens.pendingListingsStore = pendingListingsStore;
}

export function savePendingToken(token: string, data: Omit<PendingListing, 'token' | 'createdAt'>) {
  pendingListingsStore.set(token, {
    token,
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export function getPendingToken(token: string): PendingListing | undefined {
  return pendingListingsStore.get(token);
}

export function removePendingToken(token: string) {
  pendingListingsStore.delete(token);
}
