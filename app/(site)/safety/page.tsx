import type { Metadata } from 'next';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import { Icon } from '@/components/Icons';
import { DRIVER_STANDARDS, VEHICLE_STANDARDS } from '@/lib/content';
import { getCompany } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Driver Screening & Vehicle Safety Standards',
  description: 'How EdgeLIFE Transport screens drivers and inspects vans: drug testing, CORI and SORI checks, driving records, and a written check before every shift.',
  alternates: { canonical: '/safety' },
};

export default async function Safety() {
  const company = await getCompany();
  return (
    <>
      <PageHead
        title="Our safety standards, in writing."
        intro="Every family asks two questions and almost nobody asks them out loud. Is the driver sober, and is the van safe? Here are our answers, and how you can hold us to them."
      />
      <section>
        <div className="wrap">
          <div className="prose reveal" style={{ marginBottom: 64 }}>
            <p>When a transport company you have never heard of pulls up to collect your child or your mother,
              you are performing a risk assessment in about four seconds. You look at the driver. You look at the
              tires. You decide whether to let this happen.</p>
            <p>We think that instinct is completely correct, and we would rather give you real information than
              ask you to trust a logo. What follows is what we actually require. If any of it ever stops being
              true, we would want you to call us on it.</p>
          </div>

          <div className="reveal" style={{ marginBottom: 64 }}>
            <div className="eyebrow">Who is driving</div>
            <h2 style={{ marginBottom: 30 }}>Screened before hire. Re-checked after.</h2>
            <div className="std">
              {DRIVER_STANDARDS.map(s => (
                <div className="std-row" key={s.title}>
                  <div className="ico"><Icon name="user" size={21} color="#011D42" /></div>
                  <div><h4>{s.title}</h4><p>{s.detail}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal">
            <div className="eyebrow">What you are riding in</div>
            <h2 style={{ marginBottom: 30 }}>Maintained on a calendar, not on a complaint.</h2>
            <div className="std">
              {VEHICLE_STANDARDS.map(s => (
                <div className="std-row" key={s.title}>
                  <div className="ico"><Icon name="wrench" size={21} color="#011D42" /></div>
                  <div><h4>{s.title}</h4><p>{s.detail}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="alert reveal" style={{ marginTop: 44 }}>
            <Icon name="shield" size={20} color="#AF3123" />
            <div><b>Ask us for the paperwork.</b> If you want to see a driver&rsquo;s screening date, a vehicle&rsquo;s
              inspection log, or our certificate of insurance before you book, call {company.phone} and we will send it.
              A company that will not show you those documents is telling you something.</div>
          </div>

          <div style={{ marginTop: 52, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/book" className="btn btn-primary btn-lg">Book a ride</Link>
            <Link href="/fleet" className="btn btn-outline btn-lg">See the actual vehicles</Link>
          </div>
        </div>
      </section>
    </>
  );
}
