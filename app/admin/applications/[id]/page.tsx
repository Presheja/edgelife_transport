import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { APPLICATION_STATUSES, fmtStamp, type Application } from '@/lib/admin-constants';
import Link from 'next/link';
import { updateApplication, deleteApplication, hireApplicant } from '../../actions';
import { telHref } from '@/lib/format';
import RefreshBadges from '@/components/admin/RefreshBadges';
import { markSeen } from '@/lib/seen';

export const metadata = { title: 'Application' };

export default async function ApplicationDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await serviceDb()!.from('applications').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const a = data as Application;
  const firstOpen = await markSeen('applications', a.id, a.seen_at);
  const { data: driver } = await serviceDb()!.from('drivers').select('id').eq('application_id', id).maybeSingle();
  return (
    <>
      <p className="sub" style={{ marginBottom: 6 }}><Link href="/admin/applications" style={{ color: 'var(--steel)' }}>&larr; Applications</Link></p>
      {firstOpen && <RefreshBadges />}
      <h1>{a.name}</h1>
      <p className="sub">Applied {fmtStamp(a.created_at)}</p>
      {saved && <div className="flash good">Saved.</div>}
      {error && <div className="flash bad">{error === 'confirm' ? 'Tick the box to confirm the delete.' : 'Could not save. Try again.'}</div>}
      {driver ? (
        <div className="flash good">On the driver roster. <Link href={`/admin/drivers/${driver.id}`} style={{ fontWeight: 600 }}>Open their driver profile</Link></div>
      ) : (
        <form action={hireApplicant} className="adm-card" style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 20 }}>
          <input type="hidden" name="id" value={a.id} />
          <span>Ready to bring {a.name.split(' ')[0]} on? This marks the application Hired and adds them to Drivers.</span>
          <button className="abtn pri" type="submit">Hire and add to drivers</button>
        </form>
      )}
      <div className="two-col">
        <div className="adm-card">
          <h2>Applicant</h2>
          <dl className="kv">
            <dt>Phone</dt><dd><a href={telHref(a.phone)} style={{ color: 'var(--steel)', fontWeight: 600 }}>{a.phone}</a></dd>
            <dt>Email</dt><dd>{a.email ? <a href={`mailto:${a.email}`} style={{ color: 'var(--steel)' }}>{a.email}</a> : ''}</dd>
            <dt>Town</dt><dd>{a.town}</dd>
            <dt>License</dt><dd>{a.license}</dd>
            <dt>Driving experience</dt><dd>{a.years}</dd>
            <dt>Wheelchair experience</dt><dd>{a.wheelchair_exp}</dd>
            <dt>Availability</dt><dd>{a.availability}</dd>
            <dt>Agreed to screening</dt><dd>{a.consent_screening ? 'Yes' : 'No'}</dd>
            <dt>Their notes</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{a.notes}</dd>
          </dl>
        </div>
        <form action={updateApplication} className="adm-card">
          <h2>Your follow-up</h2>
          <input type="hidden" name="id" value={a.id} />
          <div className="f-grid">
            <div className="fld full"><label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={a.status}>
                {APPLICATION_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
            <div className="fld full"><label htmlFor="internal_notes">Internal notes</label>
              <textarea id="internal_notes" name="internal_notes" defaultValue={a.internal_notes ?? ''} style={{ minHeight: 160 }} /></div>
          </div>
          <div className="row-btn"><button className="abtn pri" type="submit">Save</button></div>
        </form>
      </div>
      <details className="del">
        <summary>Delete this application</summary>
        <form action={deleteApplication} className="adm-card">
          <input type="hidden" name="id" value={a.id} />
          <label className="chk-row"><input type="checkbox" name="confirm" value="yes" /> Yes, delete it permanently</label>
          <div className="row-btn"><button className="abtn danger" type="submit">Delete application</button></div>
        </form>
      </details>
    </>
  );
}
