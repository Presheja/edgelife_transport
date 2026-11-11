import type { Metadata } from 'next';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import { Icon } from '@/components/Icons';
import { AREAS } from '@/lib/content';
import { getCompany } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Service Areas',
  description: 'EdgeLIFE Transport is based in Taunton and serves Bristol, Plymouth and Norfolk county towns, with longer trips to Boston and Providence by arrangement.',
  alternates: { canonical: '/service-areas' },
};

export default async function ServiceAreas() {
  const company = await getCompany();
  return (
    <>
      <PageHead crumb={[{ href: '/service-areas', label: 'Service Areas' }]}
        title="Based in Taunton. Driving the towns around us."
        intro="Our vans are garaged in Taunton, so the communities around us get the fastest, most reliable service. Longer trips are available by arrangement." />
      <section>
        <div className="wrap">
          <div className="sec-head reveal"><div className="eyebrow">Most requested</div><h2>Where we drive most days.</h2></div>
          <div className="areas reveal">
            {AREAS.map(a => (
              <Link className="area" href={`/service-areas/${a.slug}`} key={a.slug}><b>{a.town}</b><small>{a.note}</small></Link>
            ))}
          </div>
        </div>
      </section>
      <section className="tint">
        <div className="wrap">
          <div className="sec-head reveal"><div className="eyebrow">Full coverage</div><h2>Every community we serve.</h2></div>
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 14 }}>Core service area</h3>
              <p style={{ fontSize: '.94rem', lineHeight: 1.85 }}>{company.coreTowns.join(' · ')}</p>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 14 }}>Longer trips, by arrangement</h3>
              <p style={{ fontSize: '.94rem', lineHeight: 1.85 }}>{company.extendedTowns.join(' · ')}</p>
              <p style={{ fontSize: '.88rem', marginTop: 12 }}>Quoted individually and booked ahead, so a van is free to take you.</p>
            </div>
          </div>
          <div className="areas-note reveal" style={{ marginTop: 36 }}>
            <Icon name="pin" size={19} color="#787A2F" />
            <div><b style={{ color: 'var(--navy-900)' }}>Not on the list?</b> Call {company.phone} anyway. If we cannot
              take the ride ourselves, we will tell you who can rather than leave you searching.</div>
          </div>
        </div>
      </section>
    </>
  );
}
