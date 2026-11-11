import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { fmtStamp, type Booking } from '@/lib/admin-constants';
import AdminBookingFields from '@/components/admin/BookingForm';
import { updateBooking, deleteBooking } from '../../actions';
import { telHref } from '@/lib/format';

export const metadata = { title: 'Booking' };

export default async function BookingDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await serviceDb()!.from('bookings').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const b = data as Booking;

  return (
    <>
      <h1>{b.rider_name}</h1>
      <p className="sub">
        Received {fmtStamp(b.created_at)} · {b.source === 'phone' ? 'entered by dispatch' : 'website request'} ·{' '}
        <a href={telHref(b.rider_phone)} style={{ color: 'var(--steel)', fontWeight: 600 }}>{b.rider_phone}</a>
      </p>
      {saved && <div className="flash good">Saved.</div>}
      {error && <div className="flash bad">{error === 'required' ? 'Rider name and phone are required.' : error === 'confirm' ? 'Tick the box to confirm the delete.' : 'Could not save. Try again.'}</div>}
      <form action={updateBooking} className="adm-card">
        <input type="hidden" name="id" value={b.id} />
        <AdminBookingFields b={b} />
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
