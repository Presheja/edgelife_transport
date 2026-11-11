import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { fmtStamp, type Booking, type Driver } from '@/lib/admin-constants';
import type { Vehicle } from '@/lib/vehicles';
import AdminBookingFields from '@/components/admin/BookingForm';
import { updateBooking, deleteBooking } from '../../actions';
import { telHref } from '@/lib/format';

export const metadata = { title: 'Booking' };

export default async function BookingDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string; warn?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error, warn } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = serviceDb()!;
  const [{ data }, { data: drv }, { data: veh }] = await Promise.all([
    db.from('bookings').select('*').eq('id', id).maybeSingle(),
    db.from('drivers').select('*').order('name'),
    db.from('vehicles').select('*').neq('status', 'retired').order('name'),
  ]);
  const vehicles = (veh || []) as Vehicle[];
  if (!data) notFound();
  const b = data as Booking;
  const drivers = (drv || []) as Driver[];
  const warns = (warn || '').split(',').filter(Boolean);

  return (
    <>
      <h1>{b.rider_name}</h1>
      <p className="sub">
        Received {fmtStamp(b.created_at)} · {b.source === 'phone' ? 'entered by dispatch' : 'website request'} ·{' '}
        <a href={telHref(b.rider_phone)} style={{ color: 'var(--steel)', fontWeight: 600 }}>{b.rider_phone}</a>
      </p>
      {saved && <div className="flash good">Saved.</div>}
      {warns.includes('overlap') && <div className="flash warn">Heads up: {b.driver} already has another open ride within 90 minutes of this one on the same day. Check their schedule before confirming.</div>}
      {warns.includes('wheelchair') && <div className="flash warn">Heads up: this rider uses a wheelchair, and {b.driver} is not marked as wheelchair trained.</div>}
      {warns.includes('vehicle_down') && <div className="flash warn">Heads up: {b.vehicle} is not marked as in service.</div>}
      {warns.includes('vehicle_chair') && <div className="flash warn">Heads up: this rider uses a wheelchair, and {b.vehicle} has no wheelchair positions.</div>}
      {warns.includes('inactive') && <div className="flash warn">Heads up: {b.driver} is marked inactive on the roster.</div>}
      {b.driver_id && <p className="sub" style={{ marginTop: -8 }}>Driver: <a href={`/admin/drivers/${b.driver_id}`} style={{ color: 'var(--steel)', fontWeight: 600 }}>{b.driver}</a>
        {b.vehicle_id && <> · Vehicle: <a href={`/admin/vehicles/${b.vehicle_id}`} style={{ color: 'var(--steel)', fontWeight: 600 }}>{b.vehicle}</a></>}</p>}
      {error && <div className="flash bad">{error === 'required' ? 'Rider name and phone are required.' : error === 'confirm' ? 'Tick the box to confirm the delete.' : 'Could not save. Try again.'}</div>}
      <form action={updateBooking} className="adm-card">
        <input type="hidden" name="id" value={b.id} />
        <AdminBookingFields b={b} drivers={drivers} vehicles={vehicles} />
        <div className="row-btn"><button className="abtn pri" type="submit">Save changes</button></div>
      </form>
      <details className="del">
        <summary>Delete this booking</summary>
        <form action={deleteBooking} className="adm-card">
          <input type="hidden" name="id" value={b.id} />
          <p style={{ marginBottom: 12 }}>This removes the record permanently. To keep a record, set the status to Cancelled instead.</p>
          <label className="chk-row"><input type="checkbox" name="confirm" value="yes" /> Yes, delete it permanently</label>
          <div className="row-btn"><button className="abtn danger" type="submit">Delete booking</button></div>
        </form>
      </details>
    </>
  );
}
