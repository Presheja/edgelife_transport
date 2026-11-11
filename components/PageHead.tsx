import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { breadcrumbGraph } from '@/lib/schema';
export default function PageHead({ crumb, title, intro }: { crumb?: { href: string; label: string }[]; title: string; intro?: string }) {
  return (
    <div className="pagehead">
      <div className="wrap">
        {crumb && <JsonLd data={breadcrumbGraph(crumb, title.replace(/\.$/, ''))} />}
        {crumb && <nav className="crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>{crumb.map(c => <span key={c.href}> / <Link href={c.href}>{c.label}</Link></span>)}
        </nav>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </div>
  );
}
