'use client';
import { useState } from 'react';
import { CREDITS, RELATIONSHIPS } from '@/lib/feedback';

const empty = { name: '', email: '', relationship: 'family', rating: 0, message: '', credit: 'first_initial', doNotPublish: false, website: '' };

export default function FeedbackForm({ phone }: { phone: string }) {
  const [f, setF] = useState(empty);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setF(p => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || f.message.trim().length < 10) { setErr('Please add your name and a few words about your experience.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || '');
      setDone(true);
    } catch (x) { setErr((x as Error).message || 'Something went wrong. Please call ' + phone + '.'); }
    finally { setBusy(false); }
  }

  if (done) return (
    <div className="card">
      <div className="done">
        <div className="done-ico"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#787A2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <h3>Thank you. We read every word.</h3>
        <p style={{ maxWidth: '44ch', margin: '12px auto 0' }}>
          {f.doNotPublish
            ? 'Your feedback stays with our team. It will not be published.'
            : 'If we share it on our website, it will appear only with the credit you chose. Never your full name, email, or phone.'}
          {f.email ? ' If you asked a question, we will reply by email.' : ''}
        </p>
      </div>
    </div>
  );

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h3 style={{ marginBottom: 6 }}>Tell us how it went</h3>
      <p style={{ fontSize: '.92rem', marginBottom: 26 }}>Good, bad, or somewhere in between. It all goes straight to the people who run the vans.</p>
      {err && <div className="alert" role="alert" style={{ marginBottom: 22 }}><div>{err}</div></div>}
      <div className="fg">
        <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="f-hp">Leave this field empty</label>
          <input id="f-hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={e => set('website', e.target.value)} />
        </div>
        <div className="field full">
          <span className="lbl" id="f-r-l">Your rating</span>
          <div className="stars-pick" role="radiogroup" aria-labelledby="f-r-l">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" role="radio" aria-checked={f.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className={n <= f.rating ? 'on' : ''} onClick={() => set('rating', n)}>
                <svg width="30" height="30" viewBox="0 0 20 20"><path d="M10 1l2.6 5.5 5.9.8-4.3 4.2 1 5.9L10 14.6 4.8 17.4l1-5.9L1.5 7.3l5.9-.8L10 1z" /></svg>
              </button>
            ))}
          </div>
        </div>
        <div className="field full"><label htmlFor="f-m">Your feedback</label>
          <textarea id="f-m" rows={5} maxLength={1500} value={f.message} onChange={e => set('message', e.target.value)}
            placeholder="What was the ride like? How was the driver? Anything we should do differently?" />
          <small className="hint">Please leave out medical details and other people&rsquo;s names.</small></div>
        <div className="field"><label htmlFor="f-n">Your name</label>
          <input id="f-n" autoComplete="name" value={f.name} onChange={e => set('name', e.target.value)} />
          <small className="hint">Kept private.</small></div>
        <div className="field"><label htmlFor="f-e">Email (optional)</label>
          <input id="f-e" type="email" autoComplete="email" value={f.email} onChange={e => set('email', e.target.value)} />
          <small className="hint">Only if you would like a reply. Never published.</small></div>
        <div className="field full"><label htmlFor="f-rel">You are</label>
          <select id="f-rel" value={f.relationship} onChange={e => set('relationship', e.target.value)}>
            {RELATIONSHIPS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select></div>
      </div>

      <fieldset className="consent">
        <legend>Can we share it?</legend>
        <p>We may publish feedback on our website so other families know what to expect. We only ever show your words,
          the credit you pick below, and whether you are a rider, family member, or care professional. Your full name,
          email, and phone are never published. We may shorten long comments, but we never change what you meant.</p>
        {!f.doNotPublish && (
          <div className="credit" role="radiogroup" aria-label="How to credit you">
            {CREDITS.map(c => (
              <label key={c.id} className="chk"><input type="radio" name="credit" checked={f.credit === c.id} onChange={() => set('credit', c.id)} /> {c.label}</label>
            ))}
          </div>
        )}
        <label className="chk optout"><input type="checkbox" checked={f.doNotPublish} onChange={e => set('doNotPublish', e.target.checked)} />
          Please don&rsquo;t publish my comments. Keep them private for the EdgeLIFE team.</label>
      </fieldset>

      <button className="btn btn-primary btn-lg" style={{ marginTop: 26 }} disabled={busy}>{busy ? 'Sending…' : 'Send feedback'}</button>
    </form>
  );
}
