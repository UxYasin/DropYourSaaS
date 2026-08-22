import { createClient } from '@supabase/supabase-js';

let supabaseBrowserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') return null;

  if (!supabaseBrowserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !anonKey) return null;

    supabaseBrowserClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseBrowserClient;
}
