import Link from 'next/link';
import { serviceDb } from '@/lib/supabase/admin';

/* Roster and hiring live under one Drivers tab. */
export default async function DriversTabs({ active }: { active: 'roster' | 'applications' }) {
  const db = serviceDb()!;
  const [{ count: roster }, { count: fresh }] = await Promise.all([
    db.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);
  return (
    <nav className="subtabs" aria-label="Drivers sections">
      <Link href="/admin/drivers" className={active === 'roster' ? 'on' : ''} aria-current={active === 'roster' ? 'page' : undefined}>
        Roster <span className="pill">{roster ?? 0}</span></Link>
      <Link href="/admin/applications" className={active === 'applications' ? 'on' : ''} aria-current={active === 'applications' ? 'page' : undefined}>
        Applications {(fresh ?? 0) > 0 && <span className="pill new">{fresh} new</span>}</Link>
    </nav>
  );
}
