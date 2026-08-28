// scripts/test-security-validation.js
// Tests the anti-phishing, URL sanitization, and security rules

import { validateListingSubmission } from '../lib/security.ts';

console.log('🛡️ Testing Security & Anti-Phishing Validation Pipeline...\n');

const testCases = [
  // 1. Direct IP Addresses
  { name: 'Fake Bank', url: 'http://192.168.1.1', expectedValid: false, reason: 'Direct IP address' },
  { name: 'Server IP', url: 'http://10.0.0.1/admin', expectedValid: false, reason: 'Direct IP address' },

  // 2. URL Shorteners
  { name: 'Cloaked Link', url: 'https://bit.ly/3xYz123', expectedValid: false, reason: 'Bit.ly shortener' },
  { name: 'Tiny Redirect', url: 'http://tinyurl.com/something', expectedValid: false, reason: 'Tinyurl shortener' },
  { name: 'Cutt Short', url: 'https://cutt.ly/phish', expectedValid: false, reason: 'Cutt.ly shortener' },

  // 3. Phishing / Authentication Keywords
  { name: 'MetaMask Wallet Login', url: 'https://metamask-security-update.xyz', expectedValid: false, reason: 'Crypto wallet phishing' },
  { name: 'PayPal Account Verification', url: 'https://paypal-verify-login.net/auth', expectedValid: false, reason: 'Banking impersonation' },
  { name: 'Coinbase Signin', url: 'https://coinbase.secure-auth.org', expectedValid: false, reason: 'Exchange authentication phishing' },

  // 4. Invalid URLs
  { name: 'Broken Scheme', url: 'ftp://files.example.com', expectedValid: false, reason: 'Non-HTTP protocol' },
  { name: 'Localhost', url: 'http://localhost:3000', expectedValid: false, reason: 'Localhost' },

  // 5. Valid Submissions
  { name: 'Stripe Metrics Tool', url: 'https://myanalyticstool.com', expectedValid: true, reason: 'Legitimate SaaS' },
  { name: 'Design Maker', url: 'designmaker.io', expectedValid: true, reason: 'Legitimate SaaS domain' },
  { name: 'AI Copywriter', url: 'https://aicopywriter.app/features', expectedValid: true, reason: 'Legitimate SaaS with path' },
];

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = validateListingSubmission({
    name: test.name,
    url: test.url,
    description: 'Test description',
  });

  const success = result.valid === test.expectedValid;
  if (success) {
    passed++;
    console.log(`✅ PASSED: "${test.name}" (${test.url}) -> ${result.valid ? 'ALLOWED' : 'BLOCKED: ' + result.error}`);
  } else {
    failed++;
    console.error(`❌ FAILED: "${test.name}" (${test.url}) -> Expected valid=${test.expectedValid}, Got valid=${result.valid} (${result.error})`);
  }
}

console.log(`\n========================================`);
console.log(`Results: ${passed}/${testCases.length} tests passed (${failed} failures).`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
