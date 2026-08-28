// lib/security.ts

const BLOCKED_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'is.gd',
  't.co',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'ow.ly',
  'buff.ly',
  'goo.gl',
];

const HIGH_RISK_KEYWORDS = [
  'login',
  'signin',
  'verify',
  'account',
  'banking',
  'wallet',
  'metamask',
  'paypal',
  'binance',
  'coinbase',
  'security-update',
  'auth',
  'credential',
  'passcode',
  'seed-phrase',
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedUrl?: string;
  hostname?: string;
}

export function validateListingSubmission(data: {
  name: string;
  url: string;
  description?: string;
}): ValidationResult {
  if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
    return { valid: false, error: 'A valid website URL or domain is required.' };
  }

  const rawUrl = data.url.trim().replace(/^@/, '');
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    return { valid: false, error: 'Invalid website URL format. Please provide a valid domain.' };
  }

  // 1. Enforce HTTP / HTTPS
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, error: 'URL must use standard HTTP or HTTPS protocol.' };
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

  if (!hostname || hostname.length < 3 || !hostname.includes('.')) {
    return { valid: false, error: 'Invalid domain name format.' };
  }

  // 2. Block direct IP hostnames (IPv4 & IPv6)
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipRegex.test(parsedUrl.hostname) || parsedUrl.hostname.startsWith('[') || parsedUrl.hostname.endsWith(']')) {
    return { valid: false, error: 'Direct IP addresses are not permitted. Please provide a registered domain name.' };
  }

  // 3. Block localhost and internal addresses
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname.toLowerCase())) {
    return { valid: false, error: 'Localhost addresses are not allowed for public listings.' };
  }

  // 4. Block URL shorteners (often abused for cloaking / phishing)
  if (BLOCKED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
    return {
      valid: false,
      error: 'URL shorteners (e.g. bit.ly, tinyurl) are not permitted. Please submit your direct product domain.',
    };
  }

  // 5. Check for obvious brand impersonation or phishing patterns in title/URL
  const fullCheckString = `${data.name || ''} ${parsedUrl.hostname} ${parsedUrl.pathname} ${data.description || ''}`.toLowerCase();

  // Allow our own domains
  const isWhitelistedSelfDomain =
    hostname === 'dropyoursaas.com' ||
    hostname === 'dropyoursaas.vercel.app' ||
    hostname.endsWith('.dropyoursaas.com');

  if (!isWhitelistedSelfDomain) {
    const matchedSuspiciousKeyword = HIGH_RISK_KEYWORDS.find((keyword) => {
      // Check if keyword is in hostname subdomain or path segment
      const hostSegments = parsedUrl.hostname.toLowerCase().split('.');
      const pathSegments = parsedUrl.pathname.toLowerCase().split(/[/_-]/);
      return (
        hostSegments.includes(keyword) ||
        pathSegments.includes(keyword) ||
        fullCheckString.includes(` ${keyword} `) ||
        fullCheckString.includes(`/${keyword}`)
      );
    });

    if (matchedSuspiciousKeyword) {
      return {
        valid: false,
        error: `Submission triggered anti-phishing security validation ("${matchedSuspiciousKeyword}"). Direct authentication, wallet, or banking terms are restricted.`,
      };
    }
  }

  return {
    valid: true,
    sanitizedUrl: parsedUrl.toString(),
    hostname,
  };
}
