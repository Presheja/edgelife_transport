import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { quote, normalizeRates } from '@/lib/rates';
import { money } from '@/lib/format';
import { saveRates, resetRates } from '../actions';

export const metadata = { title: 'Rates' };
export const dynamic = 'force-dynamic';

export default async function RatesPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { saved, error } = await searchParams;
  // read straight from the database so the admin always sees what is live, not the 60s public cache
  const row = await serviceDb()!.from('settings').select('value').eq('key', 'rates').maybeSingle();
  const r = normalizeRates(row.data?.value);
  const L = (k: 'ambulatory' | 'wheelchair', name: string) => (
    <div className="adm-card">
      <h2>{name}</h2>
      <div className="f-grid">
        <div className="fld"><label htmlFor={`${k}_base`}>Base fare ($)</label>
          <input id={`${k}_base`} name={`${k}_base`} inputMode="decimal" defaultValue={r[k].base} required /></div>
        <div className="fld"><label htmlFor={`${k}_included`}>Miles included in the base</label>
          <input id={`${k}_included`} name={`${k}_included`} inputMode="decimal" defaultValue={r[k].includedMiles} required /></div>
        <div className="fld"><label htmlFor={`${k}_permile`}>Per mile after that ($)</label>
          <input id={`${k}_permile`} name={`${k}_permile`} inputMode="decimal" defaultValue={r[k].perMile} required /></div>
      </div>
      <p className="sub" style={{ marginTop: 14, marginBottom: 0 }}>
        Example, 12 miles one way: {money(quote(r, { level: k, miles: 12, roundTrip: false }).total)}
      </p>
    </div>
  );
  return (
    <>
      <h1>Rates</h1>
      <p className="sub">These numbers drive the pricing page, the estimate calculator and the town pages. Changes show on the site within about a minute.</p>
      {saved && <div className="flash good">Saved. The public site will update shortly.</div>}
      {error && <div className="flash bad">{error === 'invalid' ? 'Check the numbers. Every field needs a value of zero or more.' : 'Could not save. Try again.'}</div>}
      <form action={saveRates}>
        {L('wheelchair', 'Wheelchair')}
        {L('ambulatory', 'Ambulatory')}
        <div className="adm-card">
          <div className="fld"><label htmlFor="note">Note shown under the rates</label>
            <textarea id="note" name="note" defaultValue={r.note} style={{ minHeight: 70 }} />
            <small>Good place to mention long trips, waiting time or anything that changes the price.</small></div>
        </div>
        <div className="row-btn"><button className="abtn pri" type="submit">Save rates</button></div>
      </form>
      <form action={resetRates} className="row-btn" style={{ marginTop: 10 }}>
        <button className="abtn out" type="submit">Reset to the original rates ($100 / $50, 5 miles included)</button>
      </form>
    </>
  );
}
