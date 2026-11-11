import 'server-only';
import { redirect } from 'next/navigation';
import { authClient } from '@/lib/supabase/server';

/** Admins are Supabase Auth users whose email is also in ADMIN_EMAILS. */
export function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

export async function currentAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return null;
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !allowedEmails().includes(email)) return null;
  return { id: data.user!.id, email };
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
