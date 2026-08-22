import { initDataFast } from 'datafast';

let datafastPromise: ReturnType<typeof initDataFast> | null = null;

export const DATAFAST_WEBSITE_ID =
  process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID || 'dfid_pCMXrGVLqim1H2RKI6SAv';

export function getDataFast() {
  if (typeof window === 'undefined') return null;
  if (!datafastPromise) {
    datafastPromise = initDataFast({
      websiteId: DATAFAST_WEBSITE_ID,
      autoCapturePageviews: true,
    });
  }
  return datafastPromise;
}

export async function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean>
) {
  try {
    const df = await getDataFast();
    if (df && typeof df.track === 'function') {
      df.track(name, data);
    }
  } catch (err) {
    console.error('DataFast track error:', err);
  }
}
