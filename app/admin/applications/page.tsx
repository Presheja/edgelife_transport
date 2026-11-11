import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { APPLICATION_STATUSES, fmtStamp, label, type Application } from '@/lib/admin-constants';
import DriversTabs from '@/components/admin/DriversTabs';

export const metadata = { title: 'Applications' };

export default async function Applications({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  let query = serviceDb()!.from('applications').select('*').order('created_at', { ascending: false }).limit(200);
  if (status && APPLICATION_STATUSES.some(s => s.id === status)) query = query.eq('status', status);
  const { data } = await query;
  const rows = (data || []) as Application[];
  return (
    <>
      <h1>Drivers</h1>
      <p className="sub">People who applied on the Careers page. Hire from an application to put them on the roster.</p>
      <DriversTabs active="applications" />
      <div className="filters">
        <Link href="/admin/applications" className={!status ? 'on' : ''}>All</Link>
        {APPLICATION_STATUSES.map(s => <Link key={s.id} href={`/admin/applications?status=${s.id}`} className={status === s.id ? 'on' : ''}>{s.label}</Link>)}
      </div>
      <div className="tbl-wrap">
        {rows.length === 0 ? <div className="empty">No applications yet.</div> : (
          <table className="tbl"><thead><tr><th>Applicant</th><th>Town</th><th>Experience</th><th>Availability</th><th>Status</th><th>Received</th></tr></thead><tbody>
            {rows.map(a => (
              <tr key={a.id}>
                <td>{!a.seen_at && <span className="dot" title="Not opened yet" />}<Link className="row" href={`/admin/applications/${a.id}`}>{a.name}</Link><small>{a.phone}</small></td>
                <td>{a.town}</td>
                <td>{a.years}<small>{a.wheelchair_exp}</small></td>
                <td>{a.availability}</td>
                <td><span className={`pill ${a.status}`}>{label(APPLICATION_STATUSES, a.status)}</span></td>
                <td>{fmtStamp(a.created_at)}</td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
    </>
  );
}
