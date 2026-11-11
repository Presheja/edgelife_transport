import type { Metadata } from 'next';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import { Icon } from '@/components/Icons';
import { SERVICES } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Medical Transportation Services',
  description: 'Wheelchair-accessible transport, medical appointments, hospital discharge, senior transport, adult day care routes, and errands and family events in Taunton and Southeastern Massachusetts.',
};

export default function Services() {
  return (
    <>
      <PageHead crumb={[{ href: '/services', label: 'Services' }]}
        title="Every kind of ride, with the same standard of care."
        intro="Six services, one standard. Whatever the trip is, the driver is screened, the vehicle is inspected, and the price is agreed before you commit." />
      <section>
        <div className="wrap">
          <div className="svc-grid reveal">
            {SERVICES.map(s => (
              <Link href={`/services/${s.slug}`} className="svc svc-link" key={s.slug}>
                <div className="svc-ico"><Icon name={s.icon} size={24} color="#011D42" /></div>
                <h3>{s.title}</h3><p>{s.short}</p>
                <span className="more">Learn more <Icon name="arrow" size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
