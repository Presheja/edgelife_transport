import Link from 'next/link';
export default function PageHead({ crumb, title, intro }: { crumb?: { href: string; label: string }[]; title: string; intro?: string }) {
  return (
    <div className="pagehead">
      <div className="wrap">
        {crumb && <div className="crumb">
          <Link href="/">Home</Link>{crumb.map(c => <span key={c.href}> / <Link href={c.href}>{c.label}</Link></span>)}
        </div>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </div>
  );
}
