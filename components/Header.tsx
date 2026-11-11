'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SERVICES } from '@/lib/content';
import { telHref } from '@/lib/format';
import type { Company } from '@/lib/settings';

export default function Header({ company }: { company: Company }) {
  const [shadow, setShadow] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setShadow(window.scrollY > 20);
    addEventListener('scroll', f); return () => removeEventListener('scroll', f);
  }, []);
  return (
    <>
      <div className="util">
        <div className="wrap">
          <div className="util-l">
            {company.announcement && <span>{company.announcement}</span>}
            <span className="hide-s">{company.street}, {company.city}, {company.state}</span>
          </div>
          <div className="util-l">
            <a href={telHref(company.phone)}>{company.phone}</a>
            <a href={`mailto:${company.email}`} className="hide-s">{company.email}</a>
          </div>
        </div>
      </div>
      <header style={{ boxShadow: shadow ? '0 2px 20px rgba(1,29,66,.08)' : 'none' }}>
        <div className="wrap">
          <Link href="/" className="logo"><img src="/img/logo.png" alt={company.name} /></Link>
          <nav className="main">
            <div className="dd">
              <button>Services
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
              <div className="dd-menu">
                {SERVICES.map(s => (
                  <Link key={s.slug} href={`/services/${s.slug}`}>{s.title}<span>{s.short.slice(0, 58)}…</span></Link>
                ))}
              </div>
            </div>
            <Link href="/safety">Safety</Link>
            <Link href="/fleet">Fleet</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/service-areas">Service Area</Link>
            <Link href="/careers">Careers</Link>
          </nav>
          <div className="navcta">
            <Link href="/pricing#estimate" className="btn btn-outline">Get an estimate</Link>
            <Link href="/book" className="btn btn-primary">Book a Ride</Link>
          </div>
          <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
        <nav id="mnav" className={`mnav${open ? ' open' : ''}`} aria-label="Mobile">
          <div className="mnav-in" onClick={() => setOpen(false)}>
            <div className="mnav-h">Services</div>
            {SERVICES.map(s => <Link key={s.slug} href={`/services/${s.slug}`}>{s.title}</Link>)}
            <div className="mnav-h">Company</div>
            <Link href="/safety">Safety</Link>
            <Link href="/fleet">Fleet</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/service-areas">Service Area</Link>
            <Link href="/careers">Careers</Link>
            <a href={telHref(company.phone)} className="mnav-call">Call {company.phone}</a>
          </div>
        </nav>
      </header>
    </>
  );
}
