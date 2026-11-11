import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { DEFAULT_COMPANY } from '@/lib/settings';
import { saveSettings } from '../actions';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { saved, error } = await searchParams;
  const row = await serviceDb()!.from('settings').select('value').eq('key', 'company').maybeSingle();
  const c = { ...DEFAULT_COMPANY, ...(row.data?.value || {}) };
  return (
    <>
      <h1>Site settings</h1>
      <p className="sub">Contact details, hours and service towns shown across the website. Changes show within about a minute.</p>
      {saved && <div className="flash good">Saved. The public site will update shortly.</div>}
      {error && <div className="flash bad">Could not save. Try again.</div>}
      <form action={saveSettings}>
        <div className="adm-card">
          <h2>Contact</h2>
          <div className="f-grid">
            <div className="fld"><label htmlFor="phone">Phone</label><input id="phone" name="phone" defaultValue={c.phone} required /></div>
            <div className="fld"><label htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={c.email} required /></div>
            <div className="fld full"><label htmlFor="street">Street address</label><input id="street" name="street" defaultValue={c.street} required /></div>
            <div className="fld"><label htmlFor="city">City</label><input id="city" name="city" defaultValue={c.city} required /></div>
            <div className="fld"><label htmlFor="state">State</label><input id="state" name="state" defaultValue={c.state} maxLength={2} required /></div>
            <div className="fld"><label htmlFor="zip">ZIP</label><input id="zip" name="zip" defaultValue={c.zip} required /></div>
            <div className="fld full"><label htmlFor="hours">Hours</label><input id="hours" name="hours" defaultValue={c.hours} />
              <small>Shown in the footer and on the Book page. Leave empty to hide.</small></div>
          </div>
        </div>
        <div className="adm-card">
          <h2>Messages</h2>
          <div className="f-grid">
            <div className="fld full"><label htmlFor="announcement">Top bar message</label>
              <input id="announcement" name="announcement" defaultValue={c.announcement} />
              <small>One short line at the very top of every page, such as a holiday closure or weather delay. Leave empty to hide.</small></div>
            <div className="fld full"><label htmlFor="responseTime">We call back</label>
              <input id="responseTime" name="responseTime" defaultValue={c.responseTime} />
              <small>Completes the sentence &ldquo;Dispatch will call you back ___&rdquo; after someone requests a ride. Only promise what dispatch can deliver.</small></div>
          </div>
        </div>
        <div className="adm-card">
          <h2>Towns we serve</h2>
          <div className="f-grid">
            <div className="fld full"><label htmlFor="coreTowns">Core service area</label>
              <textarea id="coreTowns" name="coreTowns" defaultValue={c.coreTowns.join('\n')} style={{ minHeight: 160 }} />
              <small>One town per line. These are the towns we drive every day.</small></div>
            <div className="fld full"><label htmlFor="extendedTowns">Longer trips, by arrangement</label>
              <textarea id="extendedTowns" name="extendedTowns" defaultValue={c.extendedTowns.join('\n')} style={{ minHeight: 140 }} />
              <small>One per line. Quoted individually and booked ahead.</small></div>
          </div>
        </div>
        <div className="row-btn"><button className="abtn pri" type="submit">Save settings</button></div>
      </form>
    </>
  );
}
