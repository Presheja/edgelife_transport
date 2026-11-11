import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHead from '@/components/PageHead';
import { Icon, Tick } from '@/components/Icons';
import { AREAS, SERVICES } from '@/lib/content';
import { money, telHref } from '@/lib/format';
import { getCompany, getRates } from '@/lib/settings';
import { quote } from '@/lib/rates';
import { OG_IMAGE } from '@/lib/site';

export function generateStaticParams() { return AREAS.map(a => ({ slug: a.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = AREAS.find(x => x.slug === slug);
  if (!a) return {};
  const description = `Wheelchair van and ambulatory rides in ${a.town}, MA, about ${a.miles} miles from our Taunton base. Rides to ${a.destinations[0]} and more. Published rates.`;
  return {
    title: `Wheelchair & Medical Rides in ${a.town}, MA`,
    description: description.length > 160 ? description.slice(0, 157).replace(/\s+\S*$/, '') + '…' : description,
    alternates: { canonical: `/service-areas/${a.slug}` },
    openGraph: { url: `/service-areas/${a.slug}`, title: `Wheelchair & Medical Rides in ${a.town}, MA`, images: [OG_IMAGE] },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = AREAS.find(x => x.slug === slug);
  if (!a) notFound();
  const [company, rates] = await Promise.all([getCompany(), getRates()]);
  const home = a.slug === 'taunton';
  const sample = quote(rates, { level: 'wheelchair', miles: a.miles, roundTrip: false });

  return (
    <>
      <PageHead crumb={[{ href: '/service-areas', label: 'Service Areas' }]}
        title={`Rides in ${a.town}, Massachusetts.`}
        intro={`Wheelchair-accessible vans and ambulatory rides serving ${a.town} and the surrounding ${a.county} County communities. ${a.note}.`} />
      <section>
        <div className="wrap">
          <div className="split">
            <div className="prose reveal">
              <p>EdgeLIFE runs regular routes through {a.town}, most often to medical appointments, adult day programs,
                and the errands, visits and appointments that state-funded rides do not cover. {a.local}</p>
              {!home && <p>{a.town} is about {a.miles} miles from our Taunton garage. As a rough guide, a one-way wheelchair ride
                of that distance comes to about {money(sample.total)} at our published rates. Dispatch quotes your exact trip before anything is booked.</p>}
              <p>Every trip is priced the same published way: a base fare that includes the first {rates.wheelchair.includedMiles} miles, then
                a per-mile charge. Wheelchair rides start at {money(rates.wheelchair.base)} plus {money(rates.wheelchair.perMile)} per extra mile.
                Ambulatory rides start at {money(rates.ambulatory.base)} plus {money(rates.ambulatory.perMile)} per extra mile.
                You will know the number before the van is dispatched.</p>
              <p>Book a few days ahead when you can. Same-day requests depend on what is on the schedule, and dispatch will give
                you an honest answer on the phone.</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 32 }}>
                <Link href="/book" className="btn btn-primary btn-lg">Book a ride in {a.town}</Link>
                <a href={telHref(company.phone)} className="btn btn-outline btn-lg"><Icon name="phone" size={16} /> {company.phone}</a>
              </div>
            </div>
            <div className="card reveal" style={{ alignSelf: 'start' }}>
              <div className="eyebrow">Where {a.town} riders often go</div>
              <ul className="checks" style={{ marginTop: 0, marginBottom: 22 }}>
                {a.destinations.map(d => <li key={d}><Tick /><div><span>{d}</span></div></li>)}
              </ul>
              <div className="eyebrow">Rides we run in {a.town}</div>
              <ul className="checks" style={{ marginTop: 0 }}>
                {SERVICES.slice(0, 4).map(s => (
                  <li key={s.slug}><Tick /><div><Link href={`/services/${s.slug}`} style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{s.title}</Link></div></li>
                ))}
              </ul>
              <div style={{ marginTop: 26, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Nearby</div>
                <p style={{ fontSize: '.92rem', lineHeight: 1.9 }}>
                  {AREAS.filter(x => x.slug !== a.slug).slice(0, 6).map((x, i, arr) => (
                    <span key={x.slug}><Link href={`/service-areas/${x.slug}`} style={{ color: 'var(--steel)' }}>{x.town}</Link>{i < arr.length - 1 ? ' · ' : ''}</span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
