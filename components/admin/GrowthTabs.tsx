import Link from 'next/link';
import { serviceDb } from '@/lib/supabase/admin';

/* Testimonials, visitor feedback and the referral network live together. */
export default async function GrowthTabs({ active }: { active: 'testimonials' | 'feedback' | 'referrals' }) {
  const db = serviceDb()!;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const [{ count: published }, { count: unseen }, { count: due }] = await Promise.all([
    db.from('testimonials').select('id', { count: 'exact', head: true }).eq('published', true),
    db.from('feedback').select('id', { count: 'exact', head: true }).is('seen_at', null),
    db.from('referral_sources').select('id', { count: 'exact', head: true }).lte('next_follow_up', today).neq('status', 'closed'),
  ]);
  const tab = (key: typeof active, href: string, label: string, extra?: React.ReactNode) => (
    <Link href={href} className={active === key ? 'on' : ''} aria-current={active === key ? 'page' : undefined}>{label}{extra}</Link>
  );
  return (
    <nav className="subtabs" aria-label="Testimonials sections">
      {tab('testimonials', '/admin/testimonials', 'Testimonials', <span className="pill">{published ?? 0} live</span>)}
      {tab('feedback', '/admin/feedback', 'Feedback', (unseen ?? 0) > 0 ? <span className="pill new">{unseen} new</span> : null)}
      {tab('referrals', '/admin/referrals', 'Referral network', (due ?? 0) > 0 ? <span className="pill new">{due} follow-up{due === 1 ? '' : 's'} due</span> : null)}
    </nav>
  );
}
