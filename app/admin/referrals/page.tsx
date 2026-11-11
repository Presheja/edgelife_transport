import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { fmtDate, label } from '@/lib/admin-constants';
import { GAP_ANSWERS, GAP_CAMPAIGN, GAP_QUESTION, GAP_THRESHOLD, ORG_TYPES, SOURCE_STATUSES, todayET, type ReferralSource } from '@/lib/referrals';
import { statsBySource, emptyStats, money } from '@/lib/referral-stats';
import GrowthTabs from '@/components/admin/GrowthTabs';

export const metadata = { title: 'Referral network' };

export default async function Referrals({ searchParams }: { searchParams: Promise<{ status?: string; tier?: string; due?: string; saved?: string; campaign?: string }> }) {
  await requireAdmin();
  const { status, tier, due, campaign } = await searchParams;
  const db = serviceDb()!;
  const today = todayET();
  const month = today.slice(0, 7);

  let q = db.from('referral_sources').select('*').order('next_follow_up', { ascending: true, nullsFirst: false }).order('organization');
  if (status && SOURCE_STATUSES.some(s => s.id === status)) q = q.eq('status', status);
  else if (!due) q = q.neq('status', 'closed');
  if (tier === '1' || tier === '2') q = q.eq('tier', Number(tier));
  if (due) q = q.lte('next_follow_up', today).neq('status', 'closed');
  if (campaign === GAP_CAMPAIGN) q = q.eq('campaign', GAP_CAMPAIGN);
  const [{ data }, { data: all }, stats, { data: monthRides }] = await Promise.all([
    q,
    db.from('referral_sources').select('status, next_follow_up, campaign, gap_answer'),
    statsBySource(),
    db.from('bookings').select('status, quoted_price, created_at, ride_date').not('referral_source_id', 'is', null).gte('created_at', month + '-01'),
  ]);
  const rows = (data || []) as ReferralSource[];
  const counts = new Map<string, number>();
  for (const r of all || []) counts.set(r.status as string, (counts.get(r.status as string) ?? 0) + 1);
  const dueCount = (all || []).filter(r => r.next_follow_up && (r.next_follow_up as string) <= today && r.status !== 'closed').length;

  const gap = (all || []).filter(r => r.campaign === GAP_CAMPAIGN);
  const asked = gap.filter(r => r.gap_answer).length;
  const noAnswer = gap.filter(r => r.gap_answer === 'no_good_answer').length;
  const m = monthRides || [];
  const requests = m.length;
  const completed = m.filter(b => b.status === 'completed').length;
  const scheduled = m.filter(b => !['declined', 'cancelled'].includes(b.status as string)).length;
  const revenue = m.filter(b => b.status === 'completed').reduce((s, b) => s + (Number(b.quoted_price) || 0), 0);
  const conversion = requests ? Math.round((scheduled / requests) * 100) : null;

  return (
    <>
      <h1>Testimonials</h1>
      <p className="sub">The referral network: facilities and professionals who send riders our way. Make EdgeLIFE easy to remember, easy to contact, and reliable enough to call again.</p>
      <GrowthTabs active="referrals" />

      {gap.length > 0 && (
        <Link href={`/admin/referrals?campaign=${GAP_CAMPAIGN}`} className={`adm-card gap-banner${noAnswer >= GAP_THRESHOLD ? ' proven' : ''}`}>
          <div>
            <span className="eyebrow-sm">GATRA-gap discovery calls</span>
            <p>&ldquo;{GAP_QUESTION}&rdquo;</p>
          </div>
          <div className="gap-score">
            <b>{noAnswer}<small> / {GAP_THRESHOLD}</small></b>
            <span>{noAnswer >= GAP_THRESHOLD
              ? 'The gap is real. The business is real.'
              : `said "no good answer" · ${asked} of ${gap.length} asked · ${Math.max(0, GAP_THRESHOLD - noAnswer)} more to prove it`}</span>
          </div>
        </Link>
      )}

      <div className="adm-grid">
        <div className="stat"><b>{completed}</b><span>Referred rides completed this month</span><small>The number that matters most</small></div>
        <div className="stat"><b>{requests}</b><span>Referral requests this month</span><small>{conversion != null ? `${conversion}% became scheduled rides` : 'No requests yet'}</small></div>
        <div className="stat"><b className="sm">{money(revenue)}</b><span>Referred revenue this month</span></div>
        <Link href="/admin/referrals?due=1" className={`stat${dueCount ? ' hot' : ''}`}><b>{dueCount}</b><span>Follow-ups due</span></Link>
      </div>

      <div className="filters">
        <Link href="/admin/referrals" className={!status && !due && !tier && !campaign ? 'on' : ''}>Open pipeline</Link>
        <Link href="/admin/referrals?due=1" className={due ? 'on' : ''}>Due today</Link>
        {gap.length > 0 && <Link href={`/admin/referrals?campaign=${GAP_CAMPAIGN}`} className={campaign ? 'on' : ''}>GATRA-gap calls {asked}/{gap.length}</Link>}
        {SOURCE_STATUSES.map(s => (
          <Link key={s.id} href={`/admin/referrals?status=${s.id}`} className={status === s.id ? 'on' : ''} title={s.hint}>{s.label} {counts.get(s.id) ?? 0}</Link>
        ))}
        <Link href="/admin/referrals?tier=1" className={tier === '1' ? 'on' : ''}>Tier 1</Link>
      </div>

      <div className="tbl-wrap">
        {rows.length === 0 ? <div className="empty">{due ? 'No follow-ups due. You are on top of it.' : 'No organizations here yet. Start with your Tier 1 targets: dialysis centers and senior living.'}</div> : (
          <table className="tbl"><thead><tr><th>Organization</th><th>Referral contact</th><th>Status</th><th>Last contact</th><th>Next follow-up</th><th>Referrals</th><th>Rides done</th><th>Revenue</th></tr></thead><tbody>
            {rows.map(s => {
              const st = stats.get(s.id) || emptyStats;
              const overdue = s.next_follow_up && s.next_follow_up < today;
              const isToday = s.next_follow_up === today;
              return (
                <tr key={s.id}>
                  <td><Link className="row" href={`/admin/referrals/${s.id}`}>{s.organization}</Link><small>{label(ORG_TYPES, s.org_type)} · Tier {s.tier}{s.area ? ` · ${s.area}` : ''}</small></td>
                  <td>{s.contact_name || <small>Not identified yet</small>}<small>{[s.contact_role, s.phone].filter(Boolean).join(' · ')}</small></td>
                  <td><span className={`pill ref-${s.status}`}>{label(SOURCE_STATUSES, s.status)}</span>{s.info_sent ? <small>Info sent</small> : null}
                    {s.gap_answer && <small className={`gap-tag ${s.gap_answer}`}>{label(GAP_ANSWERS, s.gap_answer)}</small>}</td>
                  <td>{s.last_contact ? fmtDate(s.last_contact) : <small>Never</small>}</td>
                  <td>{s.next_follow_up ? <span className={overdue ? 'pill bad' : isToday ? 'pill warn' : ''}>{overdue ? 'Overdue · ' : isToday ? 'Today' : ''}{isToday ? '' : fmtDate(s.next_follow_up)}</span> : <small>None set</small>}</td>
                  <td>{st.referrals || ''}</td>
                  <td>{st.completed || ''}</td>
                  <td>{st.revenue ? money(st.revenue) : ''}</td>
                </tr>
              );
            })}
          </tbody></table>
        )}
      </div>
      <div className="row-btn">
        <Link href="/admin/referrals/new" className="abtn pri">Add organization</Link>
        <Link href="/admin/referrals/report" className="abtn out">Weekly report</Link>
      </div>
      <p className="sub" style={{ marginTop: 18, fontSize: '.84rem' }}>Compliance reminder from the SOP: never offer gifts, discounts, free rides, or payment in exchange for healthcare referrals without legal review.</p>
    </>
  );
}
