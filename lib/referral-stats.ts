import 'server-only';
import { serviceDb } from '@/lib/supabase/admin';

export interface SourceStats { referrals: number; completed: number; declined: number; revenue: number; firstReferral: string | null; lastReferral: string | null }

/** Ride activity per referral source, from bookings that carry a referral_source_id. */
export async function statsBySource(sourceId?: string) {
  let q = serviceDb()!.from('bookings').select('referral_source_id, status, quoted_price, created_at, ride_date').not('referral_source_id', 'is', null);
  if (sourceId) q = q.eq('referral_source_id', sourceId);
  const { data } = await q;
  const map = new Map<string, SourceStats>();
  for (const b of data || []) {
    const k = b.referral_source_id as string;
    const s = map.get(k) || { referrals: 0, completed: 0, declined: 0, revenue: 0, firstReferral: null, lastReferral: null };
    s.referrals++;
    if (b.status === 'completed') { s.completed++; s.revenue += Number(b.quoted_price) || 0; }
    if (b.status === 'declined') s.declined++;
    const d = (b.created_at as string).slice(0, 10);
    if (!s.firstReferral || d < s.firstReferral) s.firstReferral = d;
    if (!s.lastReferral || d > s.lastReferral) s.lastReferral = d;
    map.set(k, s);
  }
  return map;
}
export const emptyStats: SourceStats = { referrals: 0, completed: 0, declined: 0, revenue: 0, firstReferral: null, lastReferral: null };
export const money = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
