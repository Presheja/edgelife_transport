import type { Metadata } from 'next';
import './admin.css';
import { currentAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { vehicleAlerts, type Vehicle } from '@/lib/vehicles';
import AdminShell from '@/components/admin/AdminShell';
import { signOut } from './actions';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | EdgeLIFE Admin' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

async function counts() {
  const db = serviceDb();
  if (!db) return { bookings: 0, applications: 0, vehicles: 0, growth: 0 };
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  // Badges count records nobody has opened yet, not their workflow status.
  const [b, a, v, oil, fb, fu] = await Promise.all([
    db.from('bookings').select('id', { count: 'exact', head: true }).is('seen_at', null),
    db.from('applications').select('id', { count: 'exact', head: true }).is('seen_at', null),
    db.from('vehicles').select('*').neq('status', 'retired'),
    db.from('vehicle_logs').select('vehicle_id, mileage').eq('kind', 'oil_change'),
    db.from('feedback').select('id', { count: 'exact', head: true }).is('seen_at', null),
    db.from('referral_sources').select('id', { count: 'exact', head: true }).lte('next_follow_up', today).neq('status', 'closed'),
  ]);
  const lastOil = new Map<string, number>();
  for (const r of oil.data || []) if (r.mileage != null) lastOil.set(r.vehicle_id, Math.max(lastOil.get(r.vehicle_id) ?? 0, r.mileage));
  const vehicles = ((v.data || []) as Vehicle[]).filter(x => vehicleAlerts(x, lastOil.get(x.id) ?? null).length > 0).length;
  return { bookings: b.count ?? 0, applications: a.count ?? 0, vehicles, growth: (fb.count ?? 0) + (fu.count ?? 0) };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) return <div className="adm">{children}</div>;
  return (
    <div className="adm">
      <AdminShell email={admin.email} counts={await counts()} signOut={signOut}>{children}</AdminShell>
    </div>
  );
}
