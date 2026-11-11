import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import type { Driver } from '@/lib/admin-constants';
import AdminVehicleFields from '@/components/admin/VehicleForm';
import { createVehicle } from '../../actions';

export const metadata = { title: 'Add vehicle' };

export default async function NewVehicle({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const { data } = await serviceDb()!.from('drivers').select('*').eq('status', 'active').order('name');
  return (
    <>
      <h1>Add vehicle</h1>
      <p className="sub">Only the unit name is required. Fill in the dates and the app will warn you before anything lapses.</p>
      {error && <div className="flash bad">{error === 'required' ? 'Give the vehicle a unit name.' : 'Could not save. Try again.'}</div>}
      <form action={createVehicle} className="adm-card">
        <AdminVehicleFields drivers={(data || []) as Driver[]} />
        <div className="row-btn"><button className="abtn pri" type="submit">Save vehicle</button></div>
      </form>
    </>
  );
}
