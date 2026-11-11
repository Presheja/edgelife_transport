import type { Metadata } from 'next';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import QuoteCalculator from '@/components/QuoteCalculator';
import { Icon } from '@/components/Icons';
import { buildLevels, quote } from '@/lib/rates';
import { money } from '@/lib/format';
import { getCompany, getRates } from '@/lib/settings';
import JsonLd from '@/components/JsonLd';
import { faqGraph } from '@/lib/schema';

const PRICING_FAQ: [string, string][] = [
              ['Do I have to have insurance?', 'No. Most of our private-pay riders simply want a safe, reliable ride and pay for it directly. No medical reason is required and there is no authorization to chase.'],
              ['What counts as a mile?', 'Only the miles with the rider in the vehicle, measured from pickup to destination. You are not charged for the driver getting to you or going home afterwards.'],
              ['When do I pay?', 'Dispatch confirms the price and how you will pay when they call you back, before the ride is booked. Facilities and programs can ask about invoicing.'],
              ['What if the appointment runs long?', 'Tell dispatch when you book. If you know you will be a while, we will quote the wait and return up front so there is no surprise afterwards.'],
              ['Can I cancel?', 'Call as early as you can. Dispatch will explain our cancellation terms when you book.'],
              ['Do you do stretcher transport?', 'Not at this time. Our fleet is ambulatory and wheelchair-accessible. If a rider needs stretcher-level transport we will tell you honestly and point you to a provider who does it, rather than take a booking we cannot serve properly.'],
];

export const metadata: Metadata = {
  title: 'Rates & Pricing',
  description: 'Published wheelchair and ambulatory ride rates for Taunton and Southeastern MA. A flat base fare covers the first miles, then a simple per-mile rate.',
  alternates: { canonical: '/pricing' },
};

export default async function Pricing() {
  const [company, rates] = await Promise.all([getCompany(), getRates()]);
  const levels = buildLevels(rates);
  const wc = rates.wheelchair, amb = rates.ambulatory;
  return (
    <>
      <PageHead crumb={[{ href: '/pricing', label: 'Pricing' }]}
        title="Our rates, in public, where they belong."
        intro="Nobody should have to call three companies to find out what a ride costs. Here is ours: a flat base that includes your first 5 miles, then a per-mile rate." />
      <section>
        <div className="wrap">
          <div className="rates reveal" style={{ maxWidth: 820, marginInline: 'auto' }}>
            {levels.map(l => (
              <div className={`rate${l.featured ? ' feat' : ''}`} key={l.id}>
                <h3>{l.name}</h3>
                <p style={{ fontSize: '.9rem' }}>{l.blurb}</p>
                <div className="amt"><sup>$</sup>{l.base}<span className="unit"> base</span></div>
                <div className="per">Includes the first {l.includedMiles} miles, then {money(l.perMile)} per mile</div>
                <ul>{l.includes.map(i => (
                  <li key={i}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#787A2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>{i}</li>
                ))}</ul>
              </div>
            ))}
          </div>

          <div className="two reveal" style={{ marginTop: 56 }}>
            <div className="card">
              <h3>How a price is worked out</h3>
              <p style={{ fontSize: '.94rem', marginTop: 12 }}>
                The base covers the first {wc.includedMiles} miles with the rider in the vehicle. After that, each extra mile is
                {' '}{money(wc.perMile)} for wheelchair rides and {money(amb.perMile)} for ambulatory rides. A 12-mile wheelchair
                ride is {money(quote(rates, { level: 'wheelchair', miles: 12, roundTrip: false }).total)}. A 12-mile ambulatory ride is {money(quote(rates, { level: 'ambulatory', miles: 12, roundTrip: false }).total)}.
              </p>
              {rates.note && <p style={{ fontSize: '.94rem', marginTop: 12 }}>{rates.note}</p>}
            </div>
            <div className="card">
              <h3>What &ldquo;ambulatory&rdquo; means</h3>
              <p style={{ fontSize: '.94rem', marginTop: 12 }}>
                It describes the rider, not the vehicle. An ambulatory rider can walk, with or without a cane or walker,
                and sits in a regular seat. If your rider stays in their wheelchair, power chair or scooter, it is a wheelchair
                ride and we send an accessible van.
              </p>
            </div>
          </div>

          <div className="areas-note reveal" style={{ marginTop: 44 }}>
            <Icon name="shield" size={19} color="#787A2F" />
            <div><b style={{ color: 'var(--navy-900)' }}>Have MassHealth transportation?</b> In Southeastern Massachusetts,
              MassHealth rides to covered visits are arranged through GATRA, and your provider submits the request. We are the
              answer for everything that program does not cover: same-day changes, evenings and weekends, and trips that
              are not medical. Questions? Call {company.phone}.</div>
          </div>
        </div>
      </section>

      <section className="tint">
        <div className="wrap">
          <div className="sec-head ctr reveal"><div className="eyebrow ctr">Try it</div><h2>Price your own trip.</h2></div>
          <div className="reveal"><QuoteCalculator rates={rates} towns={company.coreTowns} /></div>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div className="sec-head reveal"><div className="eyebrow">Common questions</div><h2>About paying for a ride.</h2></div>
          <JsonLd data={faqGraph(PRICING_FAQ)} />
          <div className="faq reveal">
            {PRICING_FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
          <div style={{ marginTop: 44 }}>
            <Link href="/book" className="btn btn-primary btn-lg">Book a ride</Link>
          </div>
        </div>
      </section>
    </>
  );
}
