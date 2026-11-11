import type { Metadata } from 'next';
import BookingForm from '@/components/BookingForm';
import { TickLight } from '@/components/Icons';
import { getCompany } from '@/lib/settings';
import { telHref } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Book a Ride',
  description: 'Request a wheelchair van or ambulatory ride in Taunton and Southeastern Massachusetts. No card required. Dispatch confirms your price before the ride is booked.',
};

export default async function Book() {
  const company = await getCompany();
  return (
    <section id="book" style={{ background: 'var(--sand)' }}>
      <div className="wrap">
        <div className="book reveal">
          <div className="book-side">
            <div className="eyebrow on-dark">Book a ride</div>
            <h2>Let&rsquo;s get them where they need to be.</h2>
            <p>Fill this out and dispatch will call or text you back with a firm price &mdash;
              {company.responseTime}.</p>
            <ul className="bside-list">
              {['No card required to request a ride', 'Price confirmed before the ride is booked',
                'Wheelchair and ambulatory rides', 'Weekly rides set up in one call'].map(t => (
                <li key={t}><TickLight />{t}</li>
              ))}
            </ul>
            <div className="callout">
              <small>Prefer to talk to a person?</small>
              <a href={telHref(company.phone)}>{company.phone}</a>
              <p style={{ fontSize: '.84rem', marginTop: 6, color: 'rgba(255,255,255,.5)' }}>{company.hours}</p>
            </div>
          </div>
          <BookingForm phone={company.phone} responseTime={company.responseTime} />
        </div>
      </div>
    </section>
  );
}
