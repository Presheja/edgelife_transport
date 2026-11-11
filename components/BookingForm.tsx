'use client';
import { useState } from 'react';
import { telHref } from '@/lib/format';
import { validEmail, validPhone } from '@/lib/validate';

export interface BookingInitial {
  mobility?: string;
  tripType?: string;
  pickup?: string;
  notes?: string;
}

const empty = {
  riderName: '', riderPhone: '', mobility: 'ambulatory', dementia: false,
  pickup: '', dropoff: '', date: '', time: '', tripType: 'round', website: '',
  contactName: '', relationship: 'I am the rider', email: '', payment: 'Private pay', notes: '',
};

export default function BookingForm({ phone, responseTime, initial }: { phone: string; responseTime: string; initial?: BookingInitial }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState(() => ({ ...empty, ...initial }));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setF(p => ({ ...p, [k]: v }));

  const go = (n: number) => { setStep(n); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  function continueFrom(n: number) {
    setErr('');
    if (n === 1 && (!f.riderName.trim() || !validPhone(f.riderPhone))) {
      setErr('Please enter the rider’s name and a valid phone number, including the area code.');
      return;
    }
    if (n === 2 && (!f.pickup.trim() || !f.dropoff.trim() || !f.date || !f.time)) {
      setErr('Please enter the pickup and destination addresses, ride date, and appointment time.');
      return;
    }
    go(n + 1);
  }

  async function submit() {
    if (busy) return;
    if (!f.riderName.trim() || !validPhone(f.riderPhone)) { setErr('We need a name and a valid phone number to call you back.'); go(1); return; }
    if (!f.pickup.trim() || !f.dropoff.trim() || !f.date || !f.time) { setErr('Please complete the pickup and destination addresses, date, and appointment time.'); go(2); return; }
    if (!validEmail(f.email.trim())) { setErr('Please enter a valid email address or leave it blank.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f),
      });
      const result = await r.json();
      if (!r.ok || !result.ok) {
        setErr(result.error || 'We could not save your ride request. Please call ' + phone + '.');
        return;
      }
      go(4);
    } catch {
      setErr('Something went wrong on our end. Please call ' + phone + ' and we will take the booking by phone.');
    } finally { setBusy(false); }
  }

  return (
    <div className="book-form">
      <div className="progress">{[1, 2, 3].map(i => <div key={i} className={`pstep${step >= i ? ' on' : ''}`} />)}</div>

      {err && <div className="alert" role="alert" style={{ marginBottom: 24 }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flex: '0 0 auto', marginTop: 2 }}><circle cx="10" cy="10" r="8.2" stroke="#AF3123" strokeWidth="1.5" /><path d="M10 6v5M10 13.5h.01" stroke="#AF3123" strokeWidth="1.8" strokeLinecap="round" /></svg>
        <div>{err}</div></div>}

      <div className={`fstep${step === 1 ? ' on' : ''}`}>
        <h3>Who is riding?</h3>
        <p>So we bring the right vehicle and the right level of help.</p>
        <div className="fg">
          <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
            <label htmlFor="hp">Leave this field empty</label>
            <input id="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={e => set('website', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="rn">Rider&rsquo;s full name</label>
            <input id="rn" value={f.riderName} onChange={e => set('riderName', e.target.value)} placeholder="Margaret Owusu" /></div>
          <div className="field"><label htmlFor="rp">Best phone number</label>
            <input id="rp" type="tel" value={f.riderPhone} onChange={e => set('riderPhone', e.target.value)} placeholder="(508) 555-0142" /></div>
          <div className="field full"><label>Mobility needs</label>
            <div className="seg">
              {[['ambulatory', 'Walks on their own'], ['walker', 'Walker or cane'], ['wheelchair', 'Stays in a wheelchair'], ['powerchair', 'Power chair or scooter']].map(([v, l]) => (
                <span key={v} style={{ flex: 1, minWidth: 110, display: 'flex' }}>
                  <input type="radio" name="mob" id={`mob-${v}`} checked={f.mobility === v} onChange={() => set('mobility', v)} />
                  <label htmlFor={`mob-${v}`}>{l}</label>
                </span>
              ))}
            </div></div>
          <div className="field full"><label className="chk">
            <input type="checkbox" checked={f.dementia} onChange={e => set('dementia', e.target.checked)} />
            Rider has memory loss or dementia &mdash; please assign a consistent driver
          </label></div>
        </div>
        <div className="fnav"><button type="button" className="btn btn-primary" onClick={() => continueFrom(1)}>Continue</button><span className="stepnum">Step 1 of 3</span></div>
      </div>

      <div className={`fstep${step === 2 ? ' on' : ''}`}>
        <h3>Where and when?</h3>
        <p>Give us as much as you know. We&rsquo;ll confirm the rest by phone.</p>
        <div className="fg">
          <div className="field full"><label htmlFor="pu">Pickup address</label>
            <input id="pu" value={f.pickup} onChange={e => set('pickup', e.target.value)} placeholder="12 Maple Street, Taunton, MA" /></div>
          <div className="field full"><label htmlFor="do">Destination</label>
            <input id="do" value={f.dropoff} onChange={e => set('dropoff', e.target.value)} placeholder="Morton Hospital, Taunton — Suite 4B" /></div>
          <div className="field"><label htmlFor="dt">Date</label>
            <input id="dt" type="date" value={f.date} onChange={e => set('date', e.target.value)} /></div>
          <div className="field"><label htmlFor="tm">Appointment time</label>
            <input id="tm" type="time" value={f.time} onChange={e => set('time', e.target.value)} /></div>
          <div className="field full"><label>Trip type</label>
            <div className="seg">
              {[['round', 'Round trip'], ['one', 'One way'], ['weekly', 'Recurring weekly']].map(([v, l]) => (
                <span key={v} style={{ flex: 1, minWidth: 110, display: 'flex' }}>
                  <input type="radio" name="tt" id={`tt-${v}`} checked={f.tripType === v} onChange={() => set('tripType', v)} />
                  <label htmlFor={`tt-${v}`}>{l}</label>
                </span>
              ))}
            </div></div>
        </div>
        <div className="fnav"><button type="button" className="btn btn-outline" onClick={() => go(1)}>Back</button>
          <button type="button" className="btn btn-primary" onClick={() => continueFrom(2)}>Continue</button><span className="stepnum">Step 2 of 3</span></div>
      </div>

      <div className={`fstep${step === 3 ? ' on' : ''}`}>
        <h3>How do we reach you?</h3>
        <p>Tell us who should hear from dispatch about this ride.</p>
        <div className="fg">
          <div className="field"><label htmlFor="cn">Your name</label>
            <input id="cn" value={f.contactName} onChange={e => set('contactName', e.target.value)} placeholder="If different from the rider" /></div>
          <div className="field"><label htmlFor="rel">Relationship to rider</label>
            <select id="rel" value={f.relationship} onChange={e => set('relationship', e.target.value)}>
              {['I am the rider', 'Adult child', 'Spouse or partner', 'Case manager or social worker', 'Facility staff', 'Other family or friend'].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field"><label htmlFor="em">Email</label>
            <input id="em" type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" /></div>
          <div className="field"><label htmlFor="pay">How are you paying?</label>
            <select id="pay" value={f.payment} onChange={e => set('payment', e.target.value)}>
              {['Private pay', 'Facility will be billed', 'MassHealth or broker (GATRA)', 'Not sure, please advise'].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field full"><label htmlFor="nt">Anything we should know?</label>
            <textarea id="nt" rows={3} value={f.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Oxygen tank, service dog, second-floor apartment with no elevator, prefers a female driver…" /></div>
        </div>
        <div className="fnav"><button type="button" className="btn btn-outline" onClick={() => go(2)}>Back</button>
          <button type="button" className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? 'Sending…' : 'Request this ride'}</button>
          <span className="stepnum">Step 3 of 3</span></div>
      </div>

      <div className={`fstep${step === 4 ? ' on' : ''}`}>
        <div className="done">
          <div className="done-ico"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#787A2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <h3>Request received.</h3>
          <p style={{ maxWidth: '44ch', margin: '12px auto 0' }}>
            Dispatch will call you back {responseTime} with a confirmed price.
            If it&rsquo;s urgent, call us directly at <a href={telHref(phone)} style={{ color: 'var(--brick)', fontWeight: 600 }}>{phone}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
