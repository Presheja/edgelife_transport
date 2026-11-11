/* Server-only Supabase client using the service-role key. It bypasses row-level
   security, so it must NEVER be imported into a client component. Every public
   form and every admin action goes through the server, which validates first. */
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function serviceDb(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (!cached) {
    cached = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
