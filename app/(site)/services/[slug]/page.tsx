import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHead from '@/components/PageHead';
import { Icon, Tick } from '@/components/Icons';
import { SERVICES } from '@/lib/content';
import { getCompany } from '@/lib/settings';
import { telHref } from '@/lib/format';
import JsonLd from '@/components/JsonLd';
import { serviceGraph } from '@/lib/schema';
import { OG_IMAGE } from '@/lib/site';

export function generateStaticParams() { return SERVICES.map(s => ({ slug: s.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find(x => x.slug === slug);
  if (!s) return {};
  return { title: s.title, description: s.short, alternates: { canonical: `/services/${s.slug}` }, openGraph: { title: s.title, description: s.short, url: `/services/${s.slug}`, images: [OG_IMAGE] } };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES.find(x => x.slug === slug);
  if (!s) notFound();
  const company = await getCompany();
  const others = SERVICES.filter(x => x.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd data={serviceGraph(s, company)} />
      <PageHead crumb={[{ href: '/services', label: 'Services' }]} title={s.hero} intro={s.short} />
      <section>
        <div className="wrap">
          <div className="split">
            <div className="prose reveal">
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 34 }}>
                <Link href="/book" className="btn btn-primary btn-lg">Book this service</Link>
                <a href={telHref(company.phone)} className="btn btn-outline btn-lg">
                  <Icon name="phone" size={16} /> {company.phone}
                </a>
              </div>
            </div>
            <div className="card reveal" style={{ alignSelf: 'start' }}>
              <div className="eyebrow">What&rsquo;s included</div>
              <ul className="checks" style={{ marginTop: 0 }}>
                {s.bullets.map(b => <li key={b}><Tick /><div><span>{b}</span></div></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="tint">
        <div className="wrap">
          <div className="sec-head reveal"><div className="eyebrow">Also available</div><h2>Other ways we can help.</h2></div>
          <div className="svc-grid reveal">
            {others.map(o => (
              <Link href={`/services/${o.slug}`} className="svc svc-link" key={o.slug}>
                <div className="svc-ico"><Icon name={o.icon} size={24} color="#011D42" /></div>
                <h3>{o.title}</h3><p>{o.short}</p>
                <span className="more">Learn more <Icon name="arrow" size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
