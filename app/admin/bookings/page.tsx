import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { BOOKING_STATUSES, fmtDate, fmtStamp, fmtTime, label, MOBILITY, type Booking } from '@/lib/admin-constants';

export const metadata = { title: 'Bookings' };

export default async function Bookings({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status, q } = await searchParams;
  let query = serviceDb()!.from('bookings').select('*').order('created_at', { ascending: false }).limit(200);
  if (status && BOOKING_STATUSES.some(s => s.id === status)) query = query.eq('status', status);
  const term = (q || '').trim().replace(/[%,()]/g, ' ').slice(0, 60);
  if (term) query = query.or(`rider_name.ilike.%${term}%,rider_phone.ilike.%${term}%,pickup.ilike.%${term}%,dropoff.ilike.%${term}%`);
  const { data } = await query;
  const rows = (data || []) as Booking[];

  return (
    <>
      <h1>Bookings</h1>
      <p className="sub">Requests from the website and rides entered by dispatch.</p>
      <div className="filters">
        <Link href="/admin/bookings" className={!status ? 'on' : ''}>All</Link>
        {BOOKING_STATUSES.map(s => <Link key={s.id} href={`/admin/bookings?status=${s.id}`} className={status === s.id ? 'on' : ''}>{s.label}</Link>)}
        <form action="/admin/bookings" method="get">
          {status && <input type="hidden" name="status" value={status} />}
          <input type="search" name="q" placeholder="Search name, phone, address" defaultValue={q} aria-label="Search bookings" />
          <button className="abtn nav" type="submit">Search</button>
        </form>
      </div>
      <div className="tbl-wrap">
        {rows.length === 0 ? <div className="empty">No bookings match.</div> : (
          <table className="tbl"><thead><tr><th>Rider</th><th>Ride</th><th>Route</th><th>Status</th><th>Price</th><th>Received</th></tr></thead><tbody>
            {rows.map(b => (
              <tr key={b.id}>
                <td><Link className="row" href={`/admin/bookings/${b.id}`}>{b.rider_name}</Link><small>{b.rider_phone}</small></td>
                <td>{fmtDate(b.ride_date) || 'No date'} {fmtTime(b.ride_time)}<small>{label(MOBILITY, b.mobility)}{b.memory_loss ? ' · memory loss' : ''}</small></td>
                <td style={{ minWidth: 220 }}>{b.pickup}<small>to {b.dropoff}</small></td>
                <td><span className={`pill ${b.status}`}>{label(BOOKING_STATUSES, b.status)}</span><small>{b.source === 'phone' ? 'Phone' : 'Website'}</small></td>
                <td>{b.quoted_price != null ? '$' + Number(b.quoted_price).toFixed(2) : ''}</td>
                <td>{fmtStamp(b.created_at)}</td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
      <div className="row-btn">
        <Link href="/admin/bookings/new" className="abtn pri">New booking</Link>
        <a href="/admin/bookings/export" className="abtn out">Download all as CSV</a>
      </div>
    </>
  );
}
