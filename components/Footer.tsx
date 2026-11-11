import Link from 'next/link';
import { SERVICES, AREAS } from '@/lib/content';
import { telHref } from '@/lib/format';
import type { Company } from '@/lib/settings';

export default function Footer({ company }: { company: Company }) {
  return (
    <>
      <footer>
        <div className="wrap">
          <div className="f-top">
            <div className="f-brand">
              <img src="/img/logo-white.png" alt={company.name} />
              <p>Wheelchair-accessible and ambulatory transportation in Taunton and Southeastern Massachusetts. {company.tagline}</p>
              <p style={{ marginTop: 22, fontSize: '.9rem', lineHeight: 1.8 }}>
                {company.street}<br />{company.city}, {company.state} {company.zip}<br />
                <a href={telHref(company.phone)} style={{ color: '#fff', fontWeight: 500 }}>{company.phone}</a><br />
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </p>
              {company.hours && <p style={{ marginTop: 10, fontSize: '.84rem', opacity: .7 }}>{company.hours}</p>}
            </div>
            <div className="f-col"><h4>Services</h4><ul>
              {SERVICES.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`}>{s.title.split(' & ')[0]}</Link></li>)}
            </ul></div>
            <div className="f-col"><h4>Service Area</h4><ul>
              {AREAS.slice(0, 5).map(a => <li key={a.slug}><Link href={`/service-areas/${a.slug}`}>{a.town}</Link></li>)}
              <li><Link href="/service-areas">All towns we serve</Link></li>
            </ul></div>
            <div className="f-col"><h4>Company</h4><ul>
              <li><Link href="/safety">Safety Standards</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/fleet">Our Fleet</Link></li>
              <li><Link href="/careers">Drive With Us</Link></li>
              <li><Link href="/book">Book a Ride</Link></li>
            </ul></div>
          </div>
          <div className="f-bot">
            <span>© {new Date().getFullYear()} {company.name}, LLC. All rights reserved.</span>
            <div className="lnks">
              <Link href="/privacy">Privacy Notice</Link><Link href="/terms">Terms of Use</Link>
              <Link href="/accessibility">Accessibility</Link><Link href="/privacy#dns">Do Not Sell My Information</Link>
            </div>
          </div>
        </div>
      </footer>
      <div className="mcta">
        <a href={telHref(company.phone)} className="btn btn-outline">Call now</a>
        <Link href="/book" className="btn btn-primary">Book a Ride</Link>
      </div>
    </>
  );
}
