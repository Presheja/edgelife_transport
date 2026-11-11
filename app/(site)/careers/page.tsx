import type { Metadata } from 'next';
import PageHead from '@/components/PageHead';
import CareerForm from '@/components/CareerForm';
import { Tick } from '@/components/Icons';
import { getCompany } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Drive With Us — Careers',
  description: 'Driver and attendant positions at EdgeLIFE Transport in Taunton, MA. Wheelchair van and senior transport. Training provided.',
  alternates: { canonical: '/careers' },
};

export default async function Careers() {
  const company = await getCompany();
  return (
    <>
      <PageHead crumb={[{ href: '/careers', label: 'Careers' }]}
        title="This is not a delivery job."
        intro="You will drive the same people every week. You will learn their names, their appointments, and which door is easier in the winter. If that sounds like something rather than nothing, we should talk." />
      <section>
        <div className="wrap">
          <div className="split">
            <div className="prose reveal">
              <p>Most driving work is transactional. You collect a thing, you drop the thing, nobody remembers you.
                This is not that. Our riders are often frightened, often in pain, and frequently the highlight of their
                week is the twenty minutes they spend talking to you in the van.</p>
              <p>We are looking for people who can drive carefully and be kind at the same time &mdash; which turns out
                to be a rarer combination than it should be. Wheelchair securement can be taught. Patience with an
                eighty-year-old who has asked you the same question four times cannot.</p>
              <p><b style={{ color: 'var(--navy-900)' }}>What we require:</b> a clean driving record, a clear CORI and SORI
                check, and a passed drug screen before you start &mdash; with random screening afterwards. These are
                non-negotiable, and we say so up front so nobody wastes their time.</p>
              <p><b style={{ color: 'var(--navy-900)' }}>What we provide:</b> paid training in passenger assistance and
                wheelchair securement, a well-maintained vehicle you are not fighting with, consistent routes rather than
                a chaotic queue, and a dispatcher who picks up when you call.</p>
              <ul className="checks">
                {['Full time, part time, weekend and per diem shifts',
                  'Training in wheelchair securement and passenger assistance',
                  'Assigned routes so you build real relationships with riders',
                  'Vehicles inspected daily — you are not driving something questionable',
                  'No CDL required for most positions'].map(t => (
                  <li key={t}><Tick /><div><span>{t}</span></div></li>
                ))}
              </ul>
              <p style={{ marginTop: 30 }}>Questions before you apply? Call {company.phone} and ask for hiring.</p>
            </div>
            <div className="reveal" style={{ alignSelf: 'start' }}><CareerForm phone={company.phone} /></div>
          </div>
        </div>
      </section>
    </>
  );
}
