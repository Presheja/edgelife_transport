import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { BOOKING_STATUSES, fmtDate, fmtStamp, label, type Booking } from '@/lib/admin-constants';
import { DECLINE_REASONS, ORG_TYPES, SOURCE_STATUSES, TOUCH_KINDS, suggestedFollowUp, todayET, type ReferralSource, type ReferralTouch } from '@/lib/referrals';
import { statsBySource, emptyStats, money } from '@/lib/referral-stats';
import AdminSourceFields from '@/components/admin/SourceForm';
import { updateSource, deleteSource, logTouch, deleteTouch } from '../../actions';
import { telHref } from '@/lib/format';

export const metadata = { title: 'Referral source' };

export default async function SourceDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = serviceDb()!;
  const [{ data }, { data: t }, { data: rideData }, stats] = await Promise.all([
    db.from('referral_sources').select('*').eq('id', id).maybeSingle(),
    db.from('referral_touches').select('*').eq('source_id', id).order('touch_date', { ascending: false }).order('created_at', { ascending: false }).limit(300),
    db.from('bookings').select('*').eq('referral_source_id', id).order('created_at', { ascending: false }).limit(100),
    statsBySource(id),
  ]);
  if (!data) notFound();
  const s = data as ReferralSource;
  const touches = (t || []) as ReferralTouch[];
  const rides = (rideData || []) as Booking[];
  const st = stats.get(id) || emptyStats;
  const today = todayET();
  const outward = touches.filter(x => x.kind !== 'note').length;
  const suggestion = suggestedFollowUp(outward);
  const cadence = outward === 0 ? 'First contact. The SOP follow-up is day 3 to 5.' : outward === 1 ? 'Second contact. The SOP follow-up is around day 14.' : 'Ongoing relationship. Monthly contact, not more.';
  const overdue = s.next_follow_up && s.next_follow_up < today;

  return (
    <>
      <p className="sub" style={{ marginBottom: 6 }}><Link href="/admin/referrals" style={{ color: 'var(--steel)' }}>&larr; Referral network</Link></p>
      <h1>{s.organization} <span className={`pill ref-${s.status}`} style={{ verticalAlign: 'middle' }}>{label(SOURCE_STATUSES, s.status)}</span></h1>
      <p className="sub">
        {label(ORG_TYPES, s.org_type)} · Tier {s.tier}{s.area ? ` · ${s.area}` : ''}
        {s.contact_name && <> · <b>{s.contact_name}</b>{s.contact_role ? `, ${s.contact_role}` : ''}</>}
        {s.phone && <> · <a href={telHref(s.phone)} style={{ color: 'var(--steel)', fontWeight: 600 }}>{s.phone}</a></>}
        {s.email && <> · <a href={`mailto:${s.email}`} style={{ color: 'var(--steel)' }}>{s.email}</a></>}
      </p>
      {saved === '1' && <div className="flash good">Saved.</div>}
      {saved === 'touch' && <div className="flash good">Logged.</div>}
      {saved === 'removed' && <div className="flash good">Entry removed.</div>}
      {error && <div className="flash bad">{error === 'required' ? 'The organization name is required.' : error === 'confirm' ? 'Tick the box to confirm.' : 'Could not save. Try again.'}</div>}
      {s.next_follow_up && s.next_follow_up <= today && s.status !== 'closed' && (
        <div className={`flash ${overdue ? 'bad' : 'warn'}`}>Follow-up {overdue ? `was due ${fmtDate(s.next_follow_up)}` : 'due today'}.{s.preferred_contact ? ` They prefer: ${s.preferred_contact}.` : ''}</div>
      )}
      {!s.contact_name && <div className="flash warn">No referral contact yet. The SOP is clear: the goal is a specific person who arranges rides, not the front desk.</div>}

      <div className="adm-grid">
        <div className="stat"><b>{st.referrals}</b><span>Ride requests sent</span><small>{st.firstReferral ? `First ${fmtDate(st.firstReferral)}` : 'None yet'}</small></div>
        <div className="stat"><b>{st.completed}</b><span>Rides completed</span></div>
        <div className="stat"><b className="sm">{money(st.revenue)}</b><span>Revenue from them</span></div>
        <div className="stat"><b>{st.declined}</b><span>Rides we declined</span><small>{st.declined ? 'See reasons below' : 'Good'}</small></div>
      </div>

      <div className="two-col">
        <form action={logTouch} className="adm-card" id="touch">
          <h2>Log a contact</h2>
          <input type="hidden" name="source_id" value={s.id} />
          <div className="f-grid">
            <div className="fld"><label htmlFor="kind">What happened</label>
              <select id="kind" name="kind" defaultValue="call">{TOUCH_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select></div>
            <div className="fld"><label htmlFor="touch_date">Date</label><input id="touch_date" name="touch_date" type="date" defaultValue={today} /></div>
            <div className="fld full"><label htmlFor="outcome">Outcome</label>
              <textarea id="outcome" name="outcome" placeholder="Spoke with the social worker. Uses two companies today, happy to add us as a backup. Send info by email." /></div>
            <div className="fld"><label htmlFor="new_status">Move status to</label>
              <select id="new_status" name="new_status" defaultValue="">
                <option value="">Keep as {label(SOURCE_STATUSES, s.status)}</option>
                {SOURCE_STATUSES.filter(x => x.id !== s.status).map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select></div>
            <div className="fld"><label htmlFor="t-next">Next follow-up</label>
              <input id="t-next" name="next_follow_up" type="date" defaultValue={s.status === 'closed' ? '' : suggestion} />
              <small>{cadence}</small></div>
            <div className="fld full"><label className="chk-row"><input type="checkbox" name="info_sent" /> Our information went out with this contact</label></div>
          </div>
          <div className="row-btn"><button className="abtn pri" type="submit">Log it</button></div>
        </form>

        <div>
          <h2>History</h2>
          <div className="tbl-wrap">
            {touches.length === 0 ? <div className="empty">No contact yet. Day 1: call, find the person who handles transportation, ask permission to send our info.</div> : (
              <table className="tbl"><tbody>
                {touches.map(x => (
                  <tr key={x.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(x.touch_date)}<small>{x.created_by?.split('@')[0]}</small></td>
                    <td><b>{label(TOUCH_KINDS, x.kind)}</b>{x.outcome && <small style={{ whiteSpace: 'pre-wrap' }}>{x.outcome}</small>}</td>
                    <td>
                      <form action={deleteTouch}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="source_id" value={s.id} />
                        <button className="abtn danger" style={{ padding: '3px 10px', fontSize: '.78rem' }} type="submit" aria-label="Remove entry">Remove</button></form>
                    </td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 8 }}>Rides from {s.organization}</h2>
      <div className="tbl-wrap" style={{ marginBottom: 28 }}>
        {rides.length === 0 ? <div className="empty">No rides yet. When one comes in, pick this organization as the referral source on the booking.</div> : (
          <table className="tbl"><thead><tr><th>Rider</th><th>Ride date</th><th>Status</th><th>Price</th><th>Received</th></tr></thead><tbody>
            {rides.map(b => (
              <tr key={b.id}>
                <td><Link className="row" href={`/admin/bookings/${b.id}`}>{b.rider_name}</Link></td>
                <td>{fmtDate(b.ride_date) || 'No date'}</td>
                <td><span className={`pill ${b.status}`}>{label(BOOKING_STATUSES, b.status)}</span>{b.decline_reason && <small>{label(DECLINE_REASONS, b.decline_reason)}</small>}</td>
                <td>{b.quoted_price != null ? '$' + Number(b.quoted_price).toFixed(2) : ''}</td>
                <td>{fmtStamp(b.created_at)}</td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>

      <h2>Organization details</h2>
      <form action={updateSource} className="adm-card">
        <input type="hidden" name="id" value={s.id} />
        <AdminSourceFields s={s} />
        <p className="sub" style={{ margin: '14px 0 0' }}>First contacted {s.first_contacted ? fmtDate(s.first_contacted) : 'not yet'} · Last contact {s.last_contact ? fmtDate(s.last_contact) : 'never'} · Added {fmtStamp(s.created_at)}</p>
        <div className="row-btn"><button className="abtn pri" type="submit">Save changes</button></div>
      </form>
      <details className="del">
        <summary>Delete this organization</summary>
        <form action={deleteSource} className="adm-card">
          <input type="hidden" name="id" value={s.id} />
          <p style={{ marginBottom: 12 }}>This deletes the organization and its contact history. Rides keep their record but lose the link. To stop outreach, set the status to Closed instead.</p>
          <label className="chk-row"><input type="checkbox" name="confirm" value="yes" /> Yes, delete it permanently</label>
          <div className="row-btn"><button className="abtn danger" type="submit">Delete organization</button></div>
        </form>
      </details>
    </>
  );
}
