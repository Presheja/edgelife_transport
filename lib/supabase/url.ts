/* The Supabase project URL, reduced to just its origin.
   supabase-js adds /rest/v1 itself. If the environment variable is pasted as
   https://xyz.supabase.co/rest/v1/ every request goes to /rest/v1/rest/v1/...
   and Supabase answers PGRST125 "Invalid path specified in request URL".
   Stripping any path here makes either form work. */
export function supabaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/, '');
  }
}
