'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { buildLevels, DESTINATIONS, quote, type Rates, type LevelId } from '@/lib/rates';
import { money } from '@/lib/format';

export default function QuoteCalculator({ rates, towns = [] }: { rates: Rates; towns?: string[] }) {
  const levels = useMemo(() => buildLevels(rates), [rates]);
  const [level, setLevel] = useState<LevelId>('wheelchair');
  const [dest, setDest] = useState(DESTINATIONS[1].id);
  const [miles, setMiles] = useState<number>(DESTINATIONS[1].miles);
  const [roundTrip, setRoundTrip] = useState(true);
  const [pickupTown, setPickupTown] = useState(towns[0] || 'Taunton');

  const q = useMemo(() => quote(rates, { level, miles, roundTrip }), [rates, level, miles, roundTrip]);
  const levelName = levels.find(l => l.id === level)!.name.toLowerCase();

  return (
    <div className="quote" id="estimate">
      <div className="quote-head">
        <div>
          <h3>What will my ride cost?</h3>
          <p>Most companies make you call. We&rsquo;ll just tell you.</p>
        </div>
        <span className="badge-live">Instant estimate</span>
      </div>
      <div className="quote-body">
        <div className="quote-form">
          <div className="field full">
            <label htmlFor="q-pickup">Pickup town</label>
            <input id="q-pickup" list="pickup-towns" value={pickupTown} onChange={e => setPickupTown(e.target.value)} />
            <datalist id="pickup-towns">{towns.map(town => <option key={town} value={town} />)}</datalist>
            <small>Destination mileage below is approximate from Taunton. Enter your actual one-way mileage for other pickup towns.</small>
          </div>
          <div className="field full">
            <label>Who is riding?</label>
            <div className="seg">
              {levels.map(l => (
                <span key={l.id} style={{ flex: 1, minWidth: 130, display: 'flex' }}>
                  <input type="radio" name="lvl" id={`lvl-${l.id}`} checked={level === l.id} onChange={() => setLevel(l.id)} />
                  <label htmlFor={`lvl-${l.id}`}>{l.id === 'wheelchair' ? 'Stays in a wheelchair' : 'Walks, cane or walker'}</label>
                </span>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="q-dest">Where are you going?</label>
            <select id="q-dest" value={dest} onChange={e => {
              setDest(e.target.value);
              setMiles(DESTINATIONS.find(d => d.id === e.target.value)!.miles);
            }}>
              {DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="q-miles">Miles, one way (change if you know it)</label>
            <input id="q-miles" type="number" min={0} max={200} step={1} value={miles}
              onChange={e => setMiles(Math.min(200, Math.max(0, Number(e.target.value) || 0)))} />
          </div>
          <div className="field full">
            <label htmlFor="q-trip">Trip type</label>
            <select id="q-trip" value={roundTrip ? 'r' : 'o'} onChange={e => setRoundTrip(e.target.value === 'r')}>
              <option value="r">Round trip</option>
              <option value="o">One way</option>
            </select>
          </div>
        </div>
        <div className="quote-out">
          <span className="lbl">Your estimate</span>
          <div className="price">{money(q.total)}<small>&nbsp;est.</small></div>
          <div className="price-sub">{roundTrip ? 'Round trip' : 'One way'} · {levelName} · about {miles} mi each way</div>
          <div className="bd">
            {q.lines.map((l, i) => (
              <div className="bd-row" key={i}><span>{l.label}</span><b>{money(l.amount)}</b></div>
            ))}
            <div className="bd-row tot"><span>Estimated total</span><b>{money(q.total)}</b></div>
          </div>
          <Link href={{ pathname: '/book', query: { mobility: level, miles, tripType: roundTrip ? 'round' : 'one', pickup: pickupTown, destination: DESTINATIONS.find(d => d.id === dest)!.label } }} className="btn btn-primary">Request this ride</Link>
          <p className="disclaim">Estimate only. Dispatch confirms the final price before your ride is booked, and long waits are quoted separately.</p>
        </div>
      </div>
      <div className="quote-foot">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        &ldquo;Ambulatory&rdquo; means the rider can walk, with or without a cane or walker, and sits in a regular seat.
      </div>
    </div>
  );
}
