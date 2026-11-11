import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { BOOKING_STATUSES, OPEN_STATUSES, fmtDate, fmtStamp, fmtTime, label, MOBILITY, type Booking, type Driver } from '@/lib/admin-constants';
import AdminDriverFields from '@/components/admin/DriverForm';
import { updateDriver, deleteDriver } from '../../actions';
import { telHref } from '@/lib/format';

export const metadata = { title: 'Driver' };

export default async function DriverDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = serviceDb()!;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const [{ data }, { data: up }, done] = await Promise.all([
    db.from('drivers').select('*').eq('id', id).maybeSingle(),
    db.from('bookings').select('*').eq('driver_id', id).gte('ride_date', today).in('status', OPEN_STATUSES)
      .order('ride_date', { ascending: true }).order('ride_time', { ascending: true }).limit(100),
    db.from('bookings').select('id', { count: 'exact', head: true }).eq('driver_id', id).eq('status', 'completed'),
  ]);
  if (!data) notFound();
  const d = data as Driver;
  const rides = (up || []) as Booking[];

  return (
    <>
      <h1>{d.name}</h1>
      <p className="sub">
        <a href={telHref(d.phone)} style={{ color: 'var(--steel)', fontWeight: 600 }}>{d.phone}</a>
        {' · '}{d.wheelchair_trained ? 'Wheelchair trained' : 'Not wheelchair trained'}
        {' · '}{done.count ?? 0} completed ride{done.count === 1 ? '' : 's'}
        {d.application_id && <> · <Link href={`/admin/applications/${d.application_id}`} style={{ color: 'var(--steel)' }}>Original application</Link></>}
      </p>
      {saved === 'hired' && <div className="flash good">Hired and added to the roster. Check the details below, especially wheelchair training and license expiry.</div>}
      {saved === '1' && <div className="flash good">Saved.</div>}
      {error && <div className="flash bad">{error === 'required' ? 'Name and phone are required.' : error === 'confirm' ? 'Tick the box to confirm the delete.' : 'Could not save. Try again.'}</div>}

      <h2>Upcoming rides</h2>
      <div className="tbl-wrap">
        {rides.length === 0 ? <div className="empty">Nothing scheduled.</div> : (
          <table className="tbl"><thead><tr><th>When</th><th>Rider</th><th>Route</th><th>Status</th></tr></thead><tbody>
            {rides.map(b => (
              <tr key={b.id}>
                <td>{b.ride_date === today ? 'Today' : fmtDate(b.ride_date)}<small>{fmtTime(b.ride_time) || 'Time TBD'}</small></td>
                <td><Link className="row" href={`/admin/bookings/${b.id}`}>{b.rider_name}</Link><small>{label(MOBILITY, b.mobility)}{b.memory_loss ? ' · memory loss' : ''}</small></td>
                <td style={{ minWidth: 220 }}>{b.pickup}<small>to {b.dropoff}</small></td>
                <td><span className={`pill ${b.status}`}>{label(BOOKING_STATUSES, b.status)}</span></td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>

      <h2 style={{ marginTop: 28 }}>Details</h2>
      <form action={updateDriver} className="adm-card">
        <input type="hidden" name="id" value={d.id} />
        <AdminDriverFields d={d} />
        <div className="row-btn"><button className="abtn pri" type="submit">Save changes</button></div>
        <p className="sub" style={{ marginTop: 10 }}>On the roster since {fmtStamp(d.created_at)}.</p>
      </form>
      <details className="del">
        <summary>Remove this driver</summary>
        <form action={deleteDriver} className="adm-card">
          <input type="hidden" name="id" value={d.id} />
          <p style={{ marginBottom: 12 }}>To keep their ride history, set them to Inactive instead. Removing them sends any assigned rides back to &ldquo;Needs a driver.&rdquo;</p>
          <label className="chk-row"><input type="checkbox" name="confirm" value="yes" /> Yes, remove them permanently</label>
          <div className="row-btn"><button className="abtn danger" type="submit">Remove driver</button></div>
        </form>
      </details>
    </>
  );
}
