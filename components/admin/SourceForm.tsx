import { ORG_TYPES, SOURCE_STATUSES, type ReferralSource } from '@/lib/referrals';

export default function AdminSourceFields({ s, defaultFollowUp }: { s?: ReferralSource; defaultFollowUp?: string }) {
  return (
    <div className="f-grid">
      <div className="fld full"><label htmlFor="organization">Organization</label>
        <input id="organization" name="organization" defaultValue={s?.organization} placeholder="e.g. Fresenius Kidney Care Taunton" required /></div>
      <div className="fld"><label htmlFor="org_type">Type</label>
        <select id="org_type" name="org_type" defaultValue={s?.org_type ?? 'dialysis'}>
          {ORG_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} (Tier {t.tier})</option>)}</select></div>
      <div className="fld"><label htmlFor="tier">Priority</label>
        <select id="tier" name="tier" defaultValue={s ? String(s.tier) : ''}>
          <option value="">Use the type&rsquo;s tier</option>
          <option value="1">Tier 1 · highest priority</option>
          <option value="2">Tier 2 · secondary</option></select></div>
      <div className="fld"><label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={s?.status ?? 'prospect'}>
          {SOURCE_STATUSES.map(x => <option key={x.id} value={x.id}>{x.label} · {x.hint}</option>)}</select></div>
      <div className="fld"><label htmlFor="area">Address or town</label>
        <input id="area" name="area" defaultValue={s?.area ?? ''} /></div>
      <div className="fld"><label htmlFor="contact_name">Referral contact</label>
        <input id="contact_name" name="contact_name" defaultValue={s?.contact_name ?? ''} placeholder="The person who actually arranges rides" /></div>
      <div className="fld"><label htmlFor="contact_role">Their role</label>
        <input id="contact_role" name="contact_role" defaultValue={s?.contact_role ?? ''} placeholder="Social worker, discharge planner..." /></div>
      <div className="fld"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" defaultValue={s?.phone ?? ''} /></div>
      <div className="fld"><label htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={s?.email ?? ''} /></div>
      <div className="fld"><label htmlFor="preferred_contact">Best way and time to reach them</label>
        <input id="preferred_contact" name="preferred_contact" defaultValue={s?.preferred_contact ?? ''} placeholder="Email first, avoid Monday mornings" /></div>
      <div className="fld"><label htmlFor="next_follow_up">Next follow-up</label>
        <input id="next_follow_up" name="next_follow_up" type="date" defaultValue={s?.next_follow_up ?? defaultFollowUp ?? ''} /></div>
      <div className="fld full"><label className="chk-row"><input type="checkbox" name="info_sent" defaultChecked={s?.info_sent} /> EdgeLIFE information has been sent to them</label></div>
      <div className="fld full"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" defaultValue={s?.notes ?? ''} /></div>
    </div>
  );
}
