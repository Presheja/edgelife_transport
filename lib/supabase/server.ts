/* Cookie-based Supabase client, used only to read the logged-in admin's session. */
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function authClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a Server Component; middleware refreshes the session */ }
        },
      },
    },
  );
}
