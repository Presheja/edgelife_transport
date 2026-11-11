'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/* Admin frame: left sidebar on desktop, collapsible to an icon rail,
   icon rail by default on tablets, slide-out drawer on phones. */

type IconName = 'home' | 'calendar' | 'drivers' | 'van' | 'tag' | 'quote' | 'gear' | 'profile' | 'out' | 'menu' | 'close' | 'collapse' | 'external';

function I({ n, size = 20 }: { n: IconName; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (n) {
    case 'home': return <svg {...p}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 2v5M16 2v5" /></svg>;
    case 'drivers': return <svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.3c2.1.7 3.5 2.6 3.5 5.7" /></svg>;
    case 'van': return <svg {...p}><path d="M2 17V9l3-4h10l4 4h3v8" /><circle cx="7" cy="17" r="2.2" /><circle cx="17" cy="17" r="2.2" /><path d="M9.2 17h5.6M2 13h20" /></svg>;
    case 'tag': return <svg {...p}><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>;
    case 'quote': return <svg {...p}><path d="M4 21c4-1.5 6-4.5 6-9V5H4v7h6M14 21c4-1.5 6-4.5 6-9V5h-6v7h6" /></svg>;
    case 'gear': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>;
    case 'profile': return <svg {...p}><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="10" r="3.2" /><path d="M6.2 18.6c1.2-2.2 3.3-3.4 5.8-3.4s4.6 1.2 5.8 3.4" /></svg>;
    case 'out': return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
    case 'menu': return <svg {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>;
    case 'close': return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'collapse': return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18M15.5 9.5L13 12l2.5 2.5" /></svg>;
    case 'external': return <svg {...p}><path d="M14 3h7v7M10 14L21 3M19 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h5" /></svg>;
  }
}

export interface ShellCounts { bookings: number; applications: number; vehicles: number }

export default function AdminShell({ email, counts, signOut, children }: {
  email: string; counts: ShellCounts; signOut: () => Promise<void>; children: React.ReactNode;
}) {
  const path = usePathname() || '/admin';
  const [open, setOpen] = useState(false);          // phone drawer
  const [collapsed, setCollapsed] = useState(false); // desktop rail

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('adm-rail') === '1'); } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const toggleRail = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('adm-rail', next ? '1' : '0'); } catch { /* storage unavailable */ }
  };

  const is = (...prefixes: string[]) => prefixes.some(p => (p === '/admin' ? path === '/admin' : path.startsWith(p)));
  const main = [
    { href: '/admin', label: 'Dashboard', icon: 'home' as const, on: is('/admin') },
    { href: '/admin/bookings', label: 'Bookings', icon: 'calendar' as const, on: is('/admin/bookings'), badge: counts.bookings },
    { href: '/admin/drivers', label: 'Drivers', icon: 'drivers' as const, on: is('/admin/drivers', '/admin/applications'), badge: counts.applications },
    { href: '/admin/vehicles', label: 'Vehicles', icon: 'van' as const, on: is('/admin/vehicles'), badge: counts.vehicles },
    { href: '/admin/rates', label: 'Rates', icon: 'tag' as const, on: is('/admin/rates') },
    { href: '/admin/testimonials', label: 'Testimonials', icon: 'quote' as const, on: is('/admin/testimonials') },
  ];
  const foot = [
    { href: '/admin/settings', label: 'Site settings', icon: 'gear' as const, on: is('/admin/settings') },
    { href: '/admin/profile', label: 'Profile', icon: 'profile' as const, on: is('/admin/profile') },
  ];

  const item = (l: { href: string; label: string; icon: IconName; on: boolean; badge?: number }) => (
    <Link key={l.href} href={l.href} className={`sb-link${l.on ? ' on' : ''}`} aria-current={l.on ? 'page' : undefined} title={l.label}>
      <I n={l.icon} />
      <span className="sb-label">{l.label}</span>
      {l.badge ? <span className="sb-badge" aria-label={`${l.badge} need attention`}>{l.badge}</span> : null}
    </Link>
  );

  return (
    <div className={`adm-shell${collapsed ? ' rail' : ''}${open ? ' drawer-open' : ''}`}>
      <header className="sb-mobile">
        <button type="button" className="sb-icon-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><I n="menu" size={22} /></button>
        <Link href="/admin" className="adm-brand">EdgeLIFE<small>Admin</small></Link>
        <Link href="/admin/profile" className="sb-icon-btn" aria-label="Profile"><I n="profile" size={22} /></Link>
      </header>

      <div className="sb-scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <aside className="sb" aria-label="Admin navigation">
        <div className="sb-head">
          <Link href="/admin" className="adm-brand"><span className="sb-mark">E</span><span className="sb-label">EdgeLIFE<small>Admin</small></span></Link>
          <button type="button" className="sb-icon-btn sb-close" onClick={() => setOpen(false)} aria-label="Close menu"><I n="close" /></button>
          <button type="button" className="sb-icon-btn sb-rail-btn" onClick={toggleRail} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand' : 'Collapse'}><I n="collapse" /></button>
        </div>
        <nav className="sb-nav">{main.map(item)}</nav>
        <div className="sb-foot">
          {foot.map(item)}
          <a href="/" target="_blank" rel="noopener" className="sb-link" title="View site"><I n="external" /><span className="sb-label">View site</span></a>
          <form action={signOut}>
            <button type="submit" className="sb-link" title="Sign out"><I n="out" /><span className="sb-label">Sign out</span></button>
          </form>
          <div className="sb-who sb-label" title={email}>{email}</div>
        </div>
      </aside>

      <main className="adm-main">{children}</main>
    </div>
  );
}
