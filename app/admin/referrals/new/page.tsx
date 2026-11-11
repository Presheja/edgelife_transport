import { requireAdmin } from '@/lib/auth';
import AdminSourceFields from '@/components/admin/SourceForm';
import { createSource } from '../../actions';
import { todayET } from '@/lib/referrals';

export const metadata = { title: 'Add organization' };

export default async function NewSource({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  return (
    <>
      <h1>Add organization</h1>
      <p className="sub">Goal of the first conversation: find who handles transportation, and get permission to send our information.</p>
      {error && <div className="flash bad">{error === 'required' ? 'The organization name is required.' : 'Could not save. Try again.'}</div>}
      <form action={createSource} className="adm-card">
        <AdminSourceFields defaultFollowUp={todayET()} />
        <div className="row-btn"><button className="abtn pri" type="submit">Save organization</button></div>
      </form>
    </>
  );
}
