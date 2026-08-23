import { createClient } from '@supabase/supabase-js';

// Service-role client for server-only code (route handlers, webhooks).
// Never import this from a Client Component — the key must not reach the browser.
export function getSupabaseServerClient() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://demo-project.supabase.co';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'demo-service-key';

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
