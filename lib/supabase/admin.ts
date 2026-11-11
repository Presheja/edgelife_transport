/* Server-only Supabase client using the service-role key. It bypasses row-level
   security, so it must NEVER be imported into a client component. Every public
   form and every admin action goes through the server, which validates first. */
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl } from './url';

let cached: SupabaseClient | null = null;

function secretKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function hasSupabase() {
  return Boolean(supabaseUrl() && secretKey());
}

export function serviceDb(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (!cached) {
    cached = createClient(supabaseUrl()!, secretKey()!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
