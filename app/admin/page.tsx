import Link from 'next/link';
import { requireAdmin, allowedEmails } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { vehicleAlerts, type Vehicle } from '@/lib/vehicles';
import { OPEN_STATUSES, fmtDate, fmtStamp, fmtTime, label, MOBILITY, type Booking } from '@/lib/admin-constants';

export const metadata = { title: 'Dashboard' };

export default async function Dashboard() {
  await requireAdmin();
  const db = serviceDb()!;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const week = new Date(Date.now() + 7 * 864e5).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

  const [newB, upcoming, newA, recent, sched, unassigned, fleet, oil] = await Promise.all([
    db.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('bookings').select('id', { count: 'exact', head: true }).gte('ride_date', today).lte('ride_date', week).in('status', ['new', 'confirmed', 'assigned']),
    db.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('bookings').select('*').eq('status', 'new').order('created_at', { ascending: false }).limit(6),
    db.from('bookings').select('*').eq('ride_date', today).in('status', ['new', 'confirmed', 'assigned']).order('ride_time', { ascending: true }),
    db.from('bookings').select('id', { count: 'exact', head: true }).is('driver_id', null).gte('ride_date', today).lte('ride_date', week).in('status', OPEN_STATUSES),
    db.from('vehicles').select('*').neq('status', 'retired'),
    db.from('vehicle_logs').select('vehicle_id, mileage').eq('kind', 'oil_change'),
  ]);
  const lastOil = new Map<string, number>();
  for (const r of oil.data || []) if (r.mileage != null) lastOil.set(r.vehicle_id, Math.max(lastOil.get(r.vehicle_id) ?? 0, r.mileage));
  const fleetAlerts = ((fleet.data || []) as Vehicle[]).filter(v => vehicleAlerts(v, lastOil.get(v.id) ?? null).length > 0).length;
  const recentRows = (recent.data || []) as Booking[];
  const todayRows = (sched.data || []) as Booking[];
  const mailReady = Boolean(process.env.SMTP_HOST && process.env.NOTIFY_TO);

  return (
    <>
      <h1>Dashboard</h1>
      <p className="sub">What needs attention right now.</p>

      {!mailReady && <div className="flash warn">Email alerts are off. New bookings will only appear here. Add the SMTP settings in Hostinger to get an email for each one.</div>}
      {allowedEmails().length === 0 && <div className="flash bad">ADMIN_EMAILS is empty. Set it in the environment so you can sign in.</div>}

      <div className="adm-grid">
        <Link href="/admin/bookings?status=new" className={`stat${(newB.count ?? 0) > 0 ? ' hot' : ''}`}><b>{newB.count ?? 0}</b><span>New ride requests</span></Link>
        <Link href="/admin/bookings" className="stat"><b>{upcoming.count ?? 0}</b><span>Rides in the next 7 days</span></Link>
        <Link href="/admin/bookings?status=unassigned" className={`stat${(unassigned.count ?? 0) > 0 ? ' hot' : ''}`}><b>{unassigned.count ?? 0}</b><span>Rides this week with no driver</span></Link>
        <Link href="/admin/vehicles?show=attention" className={`stat${fleetAlerts > 0 ? ' hot' : ''}`}><b>{fleetAlerts}</b><span>Vehicles need attention</span></Link>
        <Link href="/admin/applications?status=new" className={`stat${(newA.count ?? 0) > 0 ? ' hot' : ''}`}><b>{newA.count ?? 0}</b><span>New driver applications</span></Link>
      </div>

      <div className="two-col">
        <div>
          <h2>Today&rsquo;s rides</h2>
          <div className="tbl-wrap">
            {todayRows.length === 0 ? <div className="empty">Nothing scheduled for today.</div> : (
              <table className="tbl"><thead><tr><th>Time</th><th>Rider</th><th>Driver</th><th>Route</th></tr></thead><tbody>
                {todayRows.map(b => (
                  <tr key={b.id}><td>{fmtTime(b.ride_time) || 'TBD'}</td>
                    <td><Link className="row" href={`/admin/bookings/${b.id}`}>{b.rider_name}</Link><small>{label(MOBILITY, b.mobility)}</small></td>
                    <td>{b.driver_id ? <Link className="row" href={`/admin/drivers/${b.driver_id}`}>{b.driver}</Link> : <span className="pill new">Needs driver</span>}</td>
                    <td>{b.pickup}<small>to {b.dropoff}</small></td></tr>
                ))}
              </tbody></table>
            )}
          </div>
        </div>
        <div>
          <h2>Newest requests</h2>
          <div className="tbl-wrap">
            {recentRows.length === 0 ? <div className="empty">No new requests.</div> : (
              <table className="tbl"><thead><tr><th>Rider</th><th>Ride</th><th>Received</th></tr></thead><tbody>
                {recentRows.map(b => (
                  <tr key={b.id}><td><Link className="row" href={`/admin/bookings/${b.id}`}>{b.rider_name}</Link><small>{b.rider_phone}</small></td>
                    <td>{fmtDate(b.ride_date) || 'No date'}<small>{label(MOBILITY, b.mobility)}</small></td>
                    <td>{fmtStamp(b.created_at)}</td></tr>
                ))}
              </tbody></table>
            )}
          </div>
        </div>
      </div>
      <div className="row-btn"><Link href="/admin/bookings/new" className="abtn pri">New booking (phone call)</Link></div>
    </>
  );
}
