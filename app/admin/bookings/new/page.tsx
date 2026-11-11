import { requireAdmin } from '@/lib/auth';
import AdminBookingFields from '@/components/admin/BookingForm';
import { createBooking } from '../../actions';

export const metadata = { title: 'New booking' };

export default async function NewBooking({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  return (
    <>
      <h1>New booking</h1>
      <p className="sub">Enter a ride taken by phone so it lives in the same list as website requests.</p>
      {error && <div className="flash bad">{error === 'required' ? 'Rider name and phone are required.' : 'Could not save. Try again.'}</div>}
      <form action={createBooking} className="adm-card">
        <AdminBookingFields />
        <div className="row-btn"><button className="abtn pri" type="submit">Save booking</button></div>
      </form>
    </>
  );
}
