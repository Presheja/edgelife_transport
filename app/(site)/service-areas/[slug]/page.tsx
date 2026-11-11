import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHead from '@/components/PageHead';
import { Icon, Tick } from '@/components/Icons';
import { AREAS, SERVICES } from '@/lib/content';
import { money, telHref } from '@/lib/format';
import { getCompany, getRates } from '@/lib/settings';

export function generateStaticParams() { return AREAS.map(a => ({ slug: a.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = AREAS.find(x => x.slug === slug);
  if (!a) return {};
  return {
    title: `Wheelchair & Private-Pay Rides in ${a.town}, MA`,
    description: `Wheelchair-accessible and ambulatory private-pay transportation in ${a.town}, Massachusetts. Published rates, screened drivers, booked ahead.`,
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = AREAS.find(x => x.slug === slug);
  if (!a) notFound();
  const [company, rates] = await Promise.all([getCompany(), getRates()]);
  const home = a.slug === 'taunton';

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
                and the errands, visits and appointments that state-funded rides do not cover. {home
                  ? `Our vans are garaged right here in Taunton, which is why a ${a.town} pickup is the most reliable we offer.`
                  : `Our vans are garaged in Taunton, so a ${a.town} pickup is a short drive for us, and that is what keeps it dependable.`}</p>
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
              <div className="eyebrow">In {a.town} we most often drive</div>
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
