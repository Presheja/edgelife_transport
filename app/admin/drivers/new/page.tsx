import { requireAdmin } from '@/lib/auth';
import AdminDriverFields from '@/components/admin/DriverForm';
import { createDriver } from '../../actions';

export const metadata = { title: 'Add driver' };

export default async function NewDriver({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  return (
    <>
      <h1>Add driver</h1>
      <p className="sub">For drivers already on the team. New hires can be added straight from their application.</p>
      {error && <div className="flash bad">{error === 'required' ? 'Name and phone are required.' : 'Could not save. Try again.'}</div>}
      <form action={createDriver} className="adm-card">
        <AdminDriverFields />
        <div className="row-btn"><button className="abtn pri" type="submit">Save driver</button></div>
      </form>
    </>
  );
}
