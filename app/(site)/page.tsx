import Link from 'next/link';
import QuoteCalculator from '@/components/QuoteCalculator';
import BookingSection from '@/components/BookingSection';
import { Icon, Tick } from '@/components/Icons';
import { SERVICES, FLEET, AREAS, CREDENTIALS, DRIVER_STANDARDS, VEHICLE_STANDARDS } from '@/lib/content';
import { getCompany, getRates, getTestimonials } from '@/lib/settings';
import { telHref } from '@/lib/format';

export default async function Home() {
  const [company, rates, testimonials] = await Promise.all([getCompany(), getRates(), getTestimonials()]);
  const tel = telHref(company.phone);
  return (
    <>
      <div className="hero">
        <div className="hero-bg"><img src="/img/fleet-accessible.png" alt="EdgeLIFE wheelchair-accessible fleet with ramps deployed" /></div>
        <div className="hero-grain" />
        <div className="wrap">
          <div className="eyebrow on-dark">Wheelchair &amp; Medical Transportation · Taunton &amp; Southeastern Massachusetts</div>
          <h1>The ride you&rsquo;d want for <em>your own mother.</em></h1>
          <p className="lead">Wheelchair-accessible vans, screened drivers, and vehicles inspected before every shift.
            Published rates. No insurance required.</p>
          <div className="hero-cta">
            <Link href="#estimate" className="btn btn-primary btn-lg">See your price in 30 seconds <Icon name="arrow" size={16} /></Link>
            <a href={tel} className="btn btn-ghost btn-lg"><Icon name="phone" size={16} /> {company.phone}</a>
          </div>
          <div className="hero-trust">
            {[
              ['shield', 'Drug screened & CORI checked', 'Before hire, and at random after'],
              ['wrench', 'Inspected before every shift', 'Brakes, tires, ramp — written checklist'],
              ['heart', 'Door-through-door service', 'We help inside, not just outside'],
              ['clock', 'On-time or we call you', 'Live GPS tracking on every ride'],
            ].map(([i, t, s]) => (
              <div className="ht" key={t}>
                <Icon name={i} size={22} color="#C9CBA3" />
                <div><b>{t}</b><small>{s}</small></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap quote-zone"><QuoteCalculator rates={rates} towns={company.coreTowns} /></div>

      <div className="creds">
        <div className="wrap">
          {CREDENTIALS.map(c => (
            <div className="cred" key={c}><Icon name="shield" size={19} color="#787A2F" />{c}</div>
          ))}
        </div>
      </div>

      {/* ---------- the fear nobody names ---------- */}
      <section className="dark fear">
        <div className="fear-bg" aria-hidden="true">
          <img src="/img/van-ramp.jpg" alt="" loading="lazy" />
        </div>
        <div className="hero-grain" />
        <div className="wrap">
          <div className="sec-head reveal" style={{ maxWidth: '58ch' }}>
            <div className="eyebrow on-dark">Let&rsquo;s say the quiet part out loud</div>
            <h2>You are about to put someone you love in a van with a stranger.</h2>
            <p>Two things are going through your head, and neither one is polite to say. Is this driver sober?
              And is this van going to make it down the highway with the brakes it has?</p>
            <p>They are fair questions. Most companies will never answer them, so here are ours in writing.</p>
          </div>
          <div className="two">
            <div className="reveal">
              <h3 style={{ marginBottom: 22, color: '#fff' }}>The people</h3>
              <div className="std">
                {DRIVER_STANDARDS.map(s => (
                  <div className="std-row" key={s.title}>
                    <div className="ico"><Icon name="user" size={21} color="#C9CBA3" /></div>
                    <div><h4>{s.title}</h4><p>{s.detail}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal">
              <h3 style={{ marginBottom: 22, color: '#fff' }}>The vehicles</h3>
              <div className="std">
                {VEHICLE_STANDARDS.map(s => (
                  <div className="std-row" key={s.title}>
                    <div className="ico"><Icon name="wrench" size={21} color="#C9CBA3" /></div>
                    <div><h4>{s.title}</h4><p>{s.detail}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 44, textAlign: 'center' }}>
            <Link href="/safety" className="btn btn-ghost btn-lg">Read our full safety standards <Icon name="arrow" size={16} /></Link>
          </div>
        </div>
      </section>

      <section id="services">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">What we do</div>
            <h2>Every kind of ride, with the same standard of care.</h2>
            <p>Whether it&rsquo;s a weekly dialysis run, a hospital discharge, or a ride to the hair salon that no one else will take, the vehicle is clean,
              the driver is trained, and somebody answers the phone.</p>
          </div>
          <div className="svc-grid reveal">
            {SERVICES.map(s => (
              <Link href={`/services/${s.slug}`} className="svc svc-link" key={s.slug}>
                <div className="svc-ico"><Icon name={s.icon} size={24} color="#011D42" /></div>
                <h3>{s.title}</h3>
                <p>{s.short}</p>
                <span className="more">Learn more <Icon name="arrow" size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tint">
        <div className="wrap">
          <div className="split reveal">
            <div className="split-txt">
              <div className="eyebrow">Why families choose us</div>
              <h2>You are not booking a taxi. You are handing over someone you love.</h2>
              <p className="lead" style={{ marginTop: 22 }}>That distinction is the entire reason EdgeLIFE exists.
                A rideshare driver will not know how to secure a wheelchair, will not wait through a two-hour infusion,
                and will not notice that your father seems confused today. Ours will.</p>
              <ul className="checks">
                {[
                  ['The same driver, every week.', 'Standing routes get assigned drivers. Familiarity matters enormously for riders with dementia.'],
                  ['We text you when they arrive.', 'Pickup, drop-off, and any delay — to whichever family member you tell us to notify.'],
                  ['A real person answers the phone.', 'Local dispatch in Taunton. No call trees, no overseas queue, no voicemail on a Tuesday afternoon.'],
                  ['Priced before you commit.', 'You see the number up front. We do not bill surprises to families already managing a medical crisis.'],
                ].map(([b, s]) => (
                  <li key={b}><Tick /><div><b>{b}</b> <span>{s}</span></div></li>
                ))}
              </ul>
              <Link href="/book" className="btn btn-navy btn-lg" style={{ marginTop: 38 }}>Schedule a ride</Link>
            </div>
            <div className="fig">
              <img src="/img/van-ramp.jpg" alt="Wheelchair ramp deployed on an EdgeLIFE transit van" />
              <div className="fig-tag"><b>Zero transfers</b><small>Roll on. Roll off.</small></div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head ctr reveal">
            <div className="eyebrow ctr">How it works</div>
            <h2>Three steps. Under five minutes.</h2>
          </div>
          <div className="steps reveal">
            {[
              ['Tell us the details', 'Where, when, and what kind of assistance is needed. Book online in about two minutes, or call and we will take it down for you.'],
              ['We confirm the price', `Dispatch calls or texts back ${company.responseTime} with a firm price. Nothing is charged until you say yes.`],
              ['We show up early', 'Your driver arrives on time, comes to the door, and helps you all the way in. Every single time.'],
            ].map(([h, p], i) => (
              <div className="step" key={h}><div className="n">{i + 1}</div><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="tint" id="fleet">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">The fleet</div>
            <h2>Clean vehicles. Serviced on schedule. No exceptions.</h2>
            <p>We photograph our actual vans, not stock images, because you deserve to see the vehicle before it pulls up.
              Every one is GPS-tracked, sanitized between riders, and inspected to Massachusetts safety standards.</p>
          </div>
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
        </div>
      </section>

      {/* Reviews show only once there are at least three, so one lone quote never looks like the whole story. */}
      {testimonials.length >= 3 && (
        <section className="dark">
          <div className="wrap">
            <div className="quote-big reveal">
              <div className="stars">{[...Array(5)].map((_, i) => (
                <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#C9CBA3"><path d="M10 1l2.6 5.5 5.9.8-4.3 4.2 1 5.9L10 14.6 4.8 17.4l1-5.9L1.5 7.3l5.9-.8L10 1z" /></svg>
              ))}</div>
              <div className="mark">&ldquo;</div>
              <blockquote>{testimonials[0].quote}</blockquote>
              <cite><b>{testimonials[0].name}</b>{testimonials[0].role}</cite>
            </div>
            <div className="quote-row">
              {testimonials.slice(1, 4).map(t => (
                <figure className="quote-sm reveal" key={t.id}>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <cite><b>{t.name}</b>{t.role}</cite>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="areas">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Where we drive</div>
            <h2>Based in Taunton. Serving Southeastern Massachusetts.</h2>
            <p>We drive across Bristol, Plymouth and Norfolk counties, with longer trips to Boston and Providence by arrangement.
              These are the communities we serve most often.</p>
          </div>
          <div className="areas reveal">
            {AREAS.map(a => (
              <Link className="area" href={`/service-areas/${a.slug}`} key={a.slug}>
                <b>{a.town}</b><small>{a.note}</small>
              </Link>
            ))}
          </div>
          <div className="areas-note reveal">
            <Icon name="pin" size={19} color="#787A2F" />
            <div><b style={{ color: 'var(--navy-900)' }}>Don&rsquo;t see your town?</b> We serve {company.coreTowns.length}+ communities, and take longer trips by arrangement.
              Call us &mdash; if we can&rsquo;t take the ride ourselves, we will tell you who can.</div>
          </div>
        </div>
      </section>
      <BookingSection company={company} />
    </>
  );
}
