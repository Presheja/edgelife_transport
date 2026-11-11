import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { fmtDate, label } from '@/lib/admin-constants';
import { DECLINE_REASONS, ORG_TYPES, SOURCE_STATUSES, TOUCH_KINDS, addDays, todayET, type ReferralSource } from '@/lib/referrals';
import { money } from '@/lib/referral-stats';
import PrintButton from '@/components/admin/PrintButton';

export const metadata = { title: 'Weekly referral report' };

/* SOP section 13: the weekly Referral Marketing Report. */
export default async function WeeklyReport({ searchParams }: { searchParams: Promise<{ end?: string }> }) {
  await requireAdmin();
  const { end: endParam } = await searchParams;
  const end = endParam && /^\d{4}-\d{2}-\d{2}$/.test(endParam) ? endParam : todayET();
  const start = addDays(end, -6);
  const nextEnd = addDays(end, 7);
  const db = serviceDb()!;
  const [{ data: srcData }, { data: touchData }, { data: rideData }] = await Promise.all([
    db.from('referral_sources').select('*'),
    db.from('referral_touches').select('source_id, kind, touch_date').gte('touch_date', start).lte('touch_date', end),
    db.from('bookings').select('referral_source_id, status, decline_reason, quoted_price, created_at, ride_date')
      .not('referral_source_id', 'is', null).gte('created_at', start).lte('created_at', end + 'T23:59:59'),
  ]);
  const sources = (srcData || []) as ReferralSource[];
  const touches = touchData || [];
  const rides = rideData || [];
  const byId = new Map(sources.map(s => [s.id, s]));

  const newIdentified = sources.filter(s => s.created_at.slice(0, 10) >= start && s.created_at.slice(0, 10) <= end);
  const contactedIds = new Set(touches.filter(t => t.kind !== 'note').map(t => t.source_id as string));
  const newlyContacted = sources.filter(s => s.first_contacted && s.first_contacted >= start && s.first_contacted <= end);
  const touchCount = (k: string) => touches.filter(t => t.kind === k).length;
  const followUps = touches.filter(t => t.kind !== 'note').length - newlyContacted.length;
  const statusCount = (id: string) => sources.filter(s => s.status === id).length;
  const declined = rides.filter(r => r.status === 'declined');
  const reasons = new Map<string, number>();
  for (const r of declined) reasons.set(r.decline_reason as string || 'other', (reasons.get(r.decline_reason as string || 'other') ?? 0) + 1);
  const firstTimers = new Set<string>();
  for (const r of rides) {
    const s = byId.get(r.referral_source_id as string);
    if (s) firstTimers.add(s.id);
  }
  const overdue = sources.filter(s => s.next_follow_up && s.next_follow_up < end && s.status !== 'closed');
  const upcoming = sources.filter(s => s.next_follow_up && s.next_follow_up >= end && s.next_follow_up <= nextEnd && s.status !== 'closed')
    .sort((a, b) => (a.next_follow_up! < b.next_follow_up! ? -1 : 1));
  const dormantCandidates = sources.filter(s => ['active', 'repeat', 'high_value'].includes(s.status) && (!s.last_contact || s.last_contact < addDays(end, -45)));
  const revenue = rides.filter(r => r.status === 'completed').reduce((t, r) => t + (Number(r.quoted_price) || 0), 0);

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => <tr><td>{k}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{v}</td></tr>;

  return (
    <div className="report">
      <p className="sub no-print" style={{ marginBottom: 6 }}><Link href="/admin/referrals" style={{ color: 'var(--steel)' }}>&larr; Referral network</Link></p>
      <h1>Referral Marketing Report</h1>
      <p className="sub">Week of {fmtDate(start)} to {fmtDate(end)}</p>
      <div className="row-btn no-print" style={{ marginTop: 0, marginBottom: 22 }}>
        <Link href={`/admin/referrals/report?end=${addDays(end, -7)}`} className="abtn out">&larr; Previous week</Link>
        {end < todayET() && <Link href={`/admin/referrals/report?end=${addDays(end, 7)}`} className="abtn out">Next week &rarr;</Link>}
        <PrintButton />
      </div>

      <div className="two-col">
        <div className="adm-card"><h2>Activity</h2><table className="tbl"><tbody>
          <Row k="New organizations identified" v={newIdentified.length} />
          <Row k="New organizations contacted" v={newlyContacted.length} />
          <Row k="Organizations touched this week" v={contactedIds.size} />
          <Row k="Calls (spoke with someone)" v={touchCount('call')} />
          <Row k="Voicemails left" v={touchCount('voicemail')} />
          <Row k="Emails sent" v={touchCount('email')} />
          <Row k="Information packets sent" v={touchCount('info_sent')} />
          <Row k="Visits" v={touchCount('visit')} />
          <Row k="Follow-ups completed" v={Math.max(0, followUps)} />
          <Row k="After-ride check-ins" v={touchCount('after_ride')} />
        </tbody></table></div>

        <div className="adm-card"><h2>Pipeline today</h2><table className="tbl"><tbody>
          {SOURCE_STATUSES.map(s => <Row key={s.id} k={s.label} v={statusCount(s.id)} />)}
        </tbody></table></div>
      </div>

      <div className="two-col">
        <div className="adm-card"><h2>Referrals</h2><table className="tbl"><tbody>
          <Row k="Referral requests received" v={rides.length} />
          <Row k="Organizations that sent rides" v={firstTimers.size} />
          <Row k="Rides scheduled" v={rides.filter(r => ['confirmed', 'assigned', 'completed'].includes(r.status as string)).length} />
          <Row k="Rides completed" v={rides.filter(r => r.status === 'completed').length} />
          <Row k="Rides declined" v={declined.length} />
          <Row k="Revenue from completed referred rides" v={money(revenue)} />
        </tbody></table></div>

        <div className="adm-card"><h2>Why rides were declined</h2>
          {declined.length === 0 ? <p className="sub" style={{ margin: 0 }}>No declined referrals this week.</p> : (
            <table className="tbl"><tbody>{[...reasons].sort((a, b) => b[1] - a[1]).map(([k, n]) => <Row key={k} k={label(DECLINE_REASONS, k)} v={n} />)}</tbody></table>
          )}
          <p className="sub" style={{ margin: '12px 0 0', fontSize: '.84rem' }}>Repeated reasons show where viable business is being lost.</p>
        </div>
      </div>

      <div className="adm-card"><h2>Next actions</h2>
        {overdue.length === 0 && upcoming.length === 0 && dormantCandidates.length === 0 ? <p className="sub" style={{ margin: 0 }}>Nothing scheduled. Add new Tier 1 targets.</p> : (
          <table className="tbl"><thead><tr><th>Organization</th><th>Why</th><th>When</th></tr></thead><tbody>
            {overdue.map(s => <tr key={'o' + s.id}><td><Link className="row" href={`/admin/referrals/${s.id}`}>{s.organization}</Link><small>{label(ORG_TYPES, s.org_type)}</small></td><td><span className="pill bad">Overdue follow-up</span></td><td>{fmtDate(s.next_follow_up)}</td></tr>)}
            {upcoming.map(s => <tr key={'u' + s.id}><td><Link className="row" href={`/admin/referrals/${s.id}`}>{s.organization}</Link><small>{label(ORG_TYPES, s.org_type)}</small></td><td>Follow-up</td><td>{fmtDate(s.next_follow_up)}</td></tr>)}
            {dormantCandidates.map(s => <tr key={'d' + s.id}><td><Link className="row" href={`/admin/referrals/${s.id}`}>{s.organization}</Link></td><td><span className="pill warn">Active source gone quiet</span></td><td>Last contact {s.last_contact ? fmtDate(s.last_contact) : 'never'}</td></tr>)}
          </tbody></table>
        )}
      </div>
    </div>
  );
}
