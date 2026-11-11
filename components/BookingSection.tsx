import BookingForm, { type BookingInitial } from '@/components/BookingForm';
import { TickLight } from '@/components/Icons';
import type { Company } from '@/lib/settings';
import { telHref } from '@/lib/format';

/* On /book this is the page's main heading (h1); on the homepage it is a section (h2). */
export default function BookingSection({ company, initial, asPage = false }: { company: Company; initial?: BookingInitial; asPage?: boolean }) {
  const Heading = asPage ? 'h1' : 'h2';
  return (
    <section id="book" style={{ background: 'var(--sand)' }}>
      <div className="wrap">
        <div className="book">
          <div className="book-side">
            <div className="eyebrow on-dark">Book a ride</div>
            <Heading className="book-title">Let&rsquo;s get them where they need to be.</Heading>
            <p>Fill this out and dispatch will call or text you back with a firm price &mdash; {company.responseTime}.</p>
            <ul className="bside-list">
              {['No card required to request a ride', 'Price confirmed before the ride is booked',
                'Wheelchair and ambulatory rides', 'Weekly rides set up in one call'].map(t => <li key={t}><TickLight />{t}</li>)}
            </ul>
            <div className="callout">
              <small>Prefer to talk to a person?</small>
              <a href={telHref(company.phone)}>{company.phone}</a>
              <p style={{ fontSize: '.84rem', marginTop: 6, color: 'rgba(255,255,255,.5)' }}>{company.hours}</p>
            </div>
          </div>
          <BookingForm phone={company.phone} responseTime={company.responseTime} initial={initial} />
        </div>
      </div>
    </section>
  );
}
