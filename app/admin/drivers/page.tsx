import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { DRIVER_STATUSES, OPEN_STATUSES, fmtDate, label, type Driver } from '@/lib/admin-constants';
import DriversTabs from '@/components/admin/DriversTabs';

export const metadata = { title: 'Drivers' };

export default async function Drivers({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const show = status === 'inactive' || status === 'all' ? status : 'active';
  const db = serviceDb()!;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const soon = new Date(Date.now() + 30 * 864e5).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

  let q = db.from('drivers').select('*').order('name');
  if (show !== 'all') q = q.eq('status', show);
  const [{ data }, { data: rides }, { data: cars }] = await Promise.all([
    q,
    db.from('bookings').select('driver_id, ride_date').not('driver_id', 'is', null).gte('ride_date', today).in('status', OPEN_STATUSES),
    db.from('vehicles').select('id, name, driver_id').not('driver_id', 'is', null).neq('status', 'retired'),
  ]);
  const rows = (data || []) as Driver[];
  const carOf = new Map((cars || []).map(c => [c.driver_id as string, { id: c.id as string, name: c.name as string }]));
  const load = new Map<string, { today: number; upcoming: number }>();
  for (const r of rides || []) {
    const k = r.driver_id as string;
    const c = load.get(k) || { today: 0, upcoming: 0 };
    c.upcoming++; if (r.ride_date === today) c.today++;
    load.set(k, c);
  }

  return (
    <>
      <h1>Drivers</h1>
      <p className="sub">Your team. Assign drivers to rides from any booking, and to vehicles from the Vehicles page.</p>
      <DriversTabs active="roster" />
      <div className="filters">
        <Link href="/admin/drivers" className={show === 'active' ? 'on' : ''}>Active</Link>
        <Link href="/admin/drivers?status=inactive" className={show === 'inactive' ? 'on' : ''}>Inactive</Link>
        <Link href="/admin/drivers?status=all" className={show === 'all' ? 'on' : ''}>All</Link>
      </div>
      <div className="tbl-wrap">
        {rows.length === 0 ? <div className="empty">No drivers here yet. Add one, or hire an applicant from Applications.</div> : (
          <table className="tbl"><thead><tr><th>Driver</th><th>Wheelchair</th><th>Vehicle</th><th>Today</th><th>Upcoming</th><th>License</th><th>Status</th></tr></thead><tbody>
            {rows.map(d => {
              const c = load.get(d.id) || { today: 0, upcoming: 0 };
              const expiring = d.license_expires && d.license_expires <= soon;
              return (
                <tr key={d.id}>
                  <td><Link className="row" href={`/admin/drivers/${d.id}`}>{d.name}</Link><small>{d.phone}</small></td>
                  <td>{d.wheelchair_trained ? 'Trained' : <small>No</small>}</td>
                  <td>{carOf.get(d.id) ? <Link className="row" href={`/admin/vehicles/${carOf.get(d.id)!.id}`}>{carOf.get(d.id)!.name}</Link> : <small>None</small>}</td>
                  <td>{c.today || ''}</td>
                  <td>{c.upcoming ? <Link className="row" href={`/admin/bookings?driver=${d.id}`}>{c.upcoming} ride{c.upcoming === 1 ? '' : 's'}</Link> : <small>Free</small>}</td>
                  <td>{d.license_expires ? <span className={expiring ? 'pill new' : ''}>{expiring ? 'Expires ' : ''}{fmtDate(d.license_expires)}</span> : <small>Not on file</small>}</td>
                  <td><span className={`pill ${d.status}`}>{label(DRIVER_STATUSES, d.status)}</span></td>
                </tr>
              );
            })}
          </tbody></table>
        )}
      </div>
      <div className="row-btn"><Link href="/admin/drivers/new" className="abtn pri">Add driver</Link></div>
    </>
  );
}
