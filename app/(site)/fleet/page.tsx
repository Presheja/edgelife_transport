import type { Metadata } from 'next';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import { Icon } from '@/components/Icons';
import { FLEET, VEHICLE_STANDARDS } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Our Fleet',
  description: 'See the actual wheelchair-accessible vans EdgeLIFE Transport drives in Taunton and Southeastern Massachusetts. Real photos of our fleet, not stock.',
  alternates: { canonical: '/fleet' },
};

export default function Fleet() {
  return (
    <>
      <PageHead crumb={[{ href: '/fleet', label: 'Fleet' }]}
        title="These are our actual vans. Not stock photos."
        intro="You should be able to see the vehicle before it pulls into your driveway. So here they are, photographed in our own lot, ramps down." />
      <section>
        <div className="wrap">
          <div className="fleet reveal">
            {FLEET.map(v => (
              <div className="veh" key={v.name}>
                <div className="veh-img"><img src={v.img} alt={v.alt} /></div>
                <div className="veh-b">
                  <h3>{v.name}</h3><p>{v.copy}</p>
                  <div className="specs">{v.specs.map(s => <span className="spec" key={s}>{s}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="split reveal" style={{ marginTop: 76 }}>
            <div className="fig">
              <img src="/img/van-ramp.jpg" alt="Wheelchair ramp deployed at the rear of an EdgeLIFE van" />
              <div className="fig-tag"><b>Zero transfers</b><small>Roll on. Roll off.</small></div>
            </div>
            <div className="split-txt">
              <div className="eyebrow">Inside the van</div>
              <h2>The part most companies never show you.</h2>
              <p className="lead" style={{ marginTop: 20 }}>A ramp is not a feature, it is the difference between your
                mother keeping her dignity and being lifted by a stranger. Ours deploy at ground level, take a power chair
                without a running start, and lock down with four-point securement.</p>
              <p style={{ marginTop: 18 }}>Every ramp and lift is cycled and inspected at the start of each shift, because
                a ramp that fails at a hospital entrance leaves someone stranded in the cold.</p>
              <Link href="/safety" className="btn btn-navy btn-lg" style={{ marginTop: 32 }}>Our safety standards <Icon name="arrow" size={16} /></Link>
            </div>
          </div>
        </div>
      </section>
      <section className="dark">
        <div className="wrap">
          <div className="sec-head reveal"><div className="eyebrow on-dark">Maintenance</div><h2>How we keep them roadworthy.</h2></div>
          <div className="std reveal">
            {VEHICLE_STANDARDS.map(s => (
              <div className="std-row" key={s.title}>
                <div className="ico"><Icon name="wrench" size={21} color="#C9CBA3" /></div>
                <div><h4>{s.title}</h4><p>{s.detail}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
