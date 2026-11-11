'use client';
import { useState } from 'react';

const empty = { name: '', phone: '', email: '', town: '', license: 'Class D', years: '1–3 years',
  wheelchairExp: 'No', availability: 'Full time', cdl: false, notes: '', website: '' };

export default function CareerForm({ phone }: { phone: string }) {
  const [f, setF] = useState(empty);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof empty, v: any) => setF(p => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) { setErr('We need your name and a phone number.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/careers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch { setErr('Something went wrong. Please call ' + phone + '.'); }
    finally { setBusy(false); }
  }

  if (done) return (
    <div className="card">
      <div className="done">
        <div className="done-ico"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#787A2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <h3>Application received.</h3>
        <p style={{ maxWidth: '42ch', margin: '12px auto 0' }}>We read every one. If it looks like a fit we will call you
          within three business days to set up a conversation and walk you through screening.</p>
      </div>
    </div>
  );

  return (
    <form className="card" onSubmit={submit}>
      <h3 style={{ marginBottom: 6 }}>Apply to drive</h3>
      <p style={{ fontSize: '.92rem', marginBottom: 26 }}>Takes about two minutes. No resume needed to start.</p>
      {err && <div className="alert" style={{ marginBottom: 22 }}><div>{err}</div></div>}
      <div className="fg">
        <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="c-hp">Leave this field empty</label>
          <input id="c-hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={e => set('website', e.target.value)} />
        </div>
        <div className="field"><label htmlFor="c-n">Full name</label><input id="c-n" value={f.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="field"><label htmlFor="c-p">Phone</label><input id="c-p" type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div className="field"><label htmlFor="c-e">Email</label><input id="c-e" type="email" value={f.email} onChange={e => set('email', e.target.value)} /></div>
        <div className="field"><label htmlFor="c-t">Town you live in</label><input id="c-t" value={f.town} onChange={e => set('town', e.target.value)} /></div>
        <div className="field"><label htmlFor="c-l">License class</label>
          <select id="c-l" value={f.license} onChange={e => set('license', e.target.value)}>
            {['Class D', 'Class C', 'CDL B with passenger endorsement', 'CDL A'].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div className="field"><label htmlFor="c-y">Years driving professionally</label>
          <select id="c-y" value={f.years} onChange={e => set('years', e.target.value)}>
            {['Less than 1 year', '1–3 years', '3–5 years', '5+ years'].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div className="field"><label htmlFor="c-w">Wheelchair securement experience</label>
          <select id="c-w" value={f.wheelchairExp} onChange={e => set('wheelchairExp', e.target.value)}>
            {['No — willing to be trained', 'Some experience', 'Experienced', 'Certified (PASS or equivalent)'].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div className="field"><label htmlFor="c-a">Availability</label>
          <select id="c-a" value={f.availability} onChange={e => set('availability', e.target.value)}>
            {['Full time', 'Part time', 'Weekends only', 'Per diem / on call'].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div className="field full"><label htmlFor="c-x">Anything else we should know?</label>
          <textarea id="c-x" rows={3} value={f.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Languages you speak, caregiving background, why this work interests you…" /></div>
        <div className="field full"><label className="chk">
          <input type="checkbox" checked={f.cdl} onChange={e => set('cdl', e.target.checked)} />
          I understand this role requires drug screening and a CORI background check
        </label></div>
      </div>
      <button className="btn btn-primary btn-lg" style={{ marginTop: 26 }} disabled={busy}>{busy ? 'Sending…' : 'Submit application'}</button>
    </form>
  );
}
