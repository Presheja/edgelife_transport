import 'server-only';
import { serviceDb } from '@/lib/supabase/admin';

/** Marks a record as opened. Returns true only the first time, so the page can refresh the badges. */
export async function markSeen(table: 'bookings' | 'applications' | 'feedback', id: string, seenAt: string | null) {
  if (seenAt) return false;
  const { error } = await serviceDb()!.from(table).update({ seen_at: new Date().toISOString() }).eq('id', id).is('seen_at', null);
  return !error;
}
