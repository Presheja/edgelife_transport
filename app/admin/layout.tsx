import type { Metadata } from 'next';
import Link from 'next/link';
import './admin.css';
import { currentAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { signOut } from './actions';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | EdgeLIFE Admin' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

async function counts() {
  const db = serviceDb();
  if (!db) return { b: 0, a: 0 };
  const [b, a] = await Promise.all([
    db.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);
  return { b: b.count ?? 0, a: a.count ?? 0 };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  const n = admin ? await counts() : { b: 0, a: 0 };
  return (
    <div className="adm">
      {admin && (
        <div className="adm-top">
          <div className="in">
            <Link href="/admin" className="adm-brand">EdgeLIFE<small>Admin</small></Link>
            <nav className="adm-nav">
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/bookings">Bookings {n.b > 0 && <span className="adm-badge">{n.b}</span>}</Link>
              <Link href="/admin/drivers">Drivers</Link>
              <Link href="/admin/applications">Applications {n.a > 0 && <span className="adm-badge">{n.a}</span>}</Link>
              <Link href="/admin/rates">Rates</Link>
              <Link href="/admin/settings">Settings</Link>
              <Link href="/admin/testimonials">Testimonials</Link>
            </nav>
            <div className="adm-who">
              <Link href="/" target="_blank" style={{ color: 'rgba(255,255,255,.8)' }}>View site</Link>
              <span>{admin.email}</span>
              <form action={signOut}><button type="submit">Sign out</button></form>
            </div>
          </div>
        </div>
      )}
      <div className={admin ? 'adm-main' : ''}>{children}</div>
    </div>
  );
}
