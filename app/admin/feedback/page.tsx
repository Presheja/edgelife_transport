import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { fmtStamp, label } from '@/lib/admin-constants';
import { FEEDBACK_STATUSES, RELATIONSHIPS, creditName, creditRole, type Feedback } from '@/lib/feedback';
import GrowthTabs from '@/components/admin/GrowthTabs';
import RefreshBadges from '@/components/admin/RefreshBadges';
import { publishFeedback, setFeedbackStatus } from '../actions';

export const metadata = { title: 'Feedback' };

const Stars = ({ n }: { n: number | null }) => n ? (
  <span aria-label={`${n} out of 5`} style={{ color: 'var(--olive)', letterSpacing: 2 }}>{'★'.repeat(n)}<span style={{ color: '#DDD6C8' }}>{'★'.repeat(5 - n)}</span></span>
) : <small>No rating</small>;

export default async function FeedbackAdmin({ searchParams }: { searchParams: Promise<{ show?: string; saved?: string }> }) {
  await requireAdmin();
  const { show, saved } = await searchParams;
  const db = serviceDb()!;
  let q = db.from('feedback').select('*').order('created_at', { ascending: false }).limit(200);
  if (show && FEEDBACK_STATUSES.some(s => s.id === show)) q = q.eq('status', show);
  const [{ data }, { count: live }] = await Promise.all([
    q, db.from('testimonials').select('id', { count: 'exact', head: true }).eq('published', true),
  ]);
  const rows = (data || []) as Feedback[];

  // Opening this page counts as seeing everything on it.
  const unseen = rows.filter(r => !r.seen_at).map(r => r.id);
  if (unseen.length) await db.from('feedback').update({ seen_at: new Date().toISOString() }).in('id', unseen);
  const stillNeeded = Math.max(0, 3 - (live ?? 0));

  return (
    <>
      {unseen.length > 0 && <RefreshBadges />}
      <h1>Testimonials</h1>
      <p className="sub">Feedback left on the website. Publishing turns it into a testimonial, using only the credit the writer chose.</p>
      <GrowthTabs active="feedback" />
      {saved === 'published' && <div className="flash good">Published as a testimonial.{stillNeeded > 0 ? ` ${stillNeeded} more and the homepage section switches on.` : ''}</div>}
      {saved === '1' && <div className="flash good">Saved.</div>}
      {stillNeeded > 0 && !saved && <div className="flash warn">The homepage reviews section switches on at 3 published testimonials. You have {live ?? 0}.</div>}
      <div className="filters">
        <Link href="/admin/feedback" className={!show ? 'on' : ''}>All</Link>
        {FEEDBACK_STATUSES.map(s => <Link key={s.id} href={`/admin/feedback?show=${s.id}`} className={show === s.id ? 'on' : ''}>{s.label}</Link>)}
      </div>
      {rows.length === 0 ? <div className="tbl-wrap"><div className="empty">No feedback yet. The form is linked from the footer of every page, at /feedback.</div></div> : rows.map(f => (
        <article key={f.id} className="adm-card fb">
          <div className="fb-head">
            <div>{!f.seen_at && <span className="dot" title="New" />}<Stars n={f.rating} /> <span className={`pill ${f.status === 'published' ? 'completed' : f.status === 'hidden' ? 'cancelled' : f.status}`}>{label(FEEDBACK_STATUSES, f.status)}</span></div>
            <small>{fmtStamp(f.created_at)}</small>
          </div>
          <blockquote className="fb-msg">{f.message}</blockquote>
          <dl className="kv">
            <dt>From (private)</dt><dd>{f.name}{f.email && <> · <a href={`mailto:${f.email}`} style={{ color: 'var(--steel)' }}>{f.email}</a></>}</dd>
            <dt>Relationship</dt><dd>{label(RELATIONSHIPS, f.relationship)}</dd>
            <dt>Publishing</dt><dd>{f.allow_publish
              ? <>Allowed. Would appear as <b>{creditName(f.name, f.credit)}</b>, {creditRole(f.relationship)}</>
              : <b style={{ color: '#8A1F14' }}>Asked not to be published</b>}</dd>
          </dl>
          <div className="row-btn">
            {f.allow_publish && f.status !== 'published' && (
              <form action={publishFeedback}><input type="hidden" name="id" value={f.id} />
                <button className="abtn pri" type="submit">Publish as testimonial</button></form>
            )}
            {f.status === 'published' && <Link href="/admin/testimonials" className="abtn out">Manage on Testimonials</Link>}
            {f.status !== 'reviewed' && f.status !== 'published' && (
              <form action={setFeedbackStatus}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="status" value="reviewed" />
                <button className="abtn out" type="submit">Mark reviewed</button></form>
            )}
            {f.status !== 'hidden' && f.status !== 'published' && (
              <form action={setFeedbackStatus}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="status" value="hidden" />
                <button className="abtn danger" type="submit">Don&rsquo;t publish</button></form>
            )}
          </div>
        </article>
      ))}
    </>
  );
}
