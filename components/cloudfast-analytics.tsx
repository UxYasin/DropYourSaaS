import Script from 'next/script';

export function CloudFastAnalytics() {
  const siteId =
    process.env.NEXT_PUBLIC_CLOUDFAST_SITE_ID || 'site_7eead08c70e7';
  const scriptUrl =
    process.env.NEXT_PUBLIC_CLOUDFAST_SCRIPT_URL ||
    'https://cloudfast.vercel.app/t.js';

  if (!siteId) return null;

  return (
    <Script
      src={scriptUrl}
      data-site={siteId}
      strategy="afterInteractive"
      defer
    />
  );
}
