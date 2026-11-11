import PageHead from '@/components/PageHead';
import { getCompany } from '@/lib/settings';

export const metadata = { title: 'Accessibility Statement' };

export default async function Page() {
  const c = await getCompany();
  return (
    <>
      <PageHead title="Accessibility Statement" intro="A transportation company for people with mobility needs should have a website everyone can use." />
      <section><div className="wrap"><div className="prose">
        <p>We want everyone to be able to read this site, request a ride and apply to drive, including people who use screen readers, keyboards,
          magnification or voice control. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, level AA.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>What we do</h2>
        <p>Forms have labels and can be completed with a keyboard. Text is sized in relative units and keeps strong contrast against its background.
          Images carry descriptions. Pages are built with headings and landmarks so assistive technology can move through them.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Not able to use the website?</h2>
        <p>You never need the website to ride with us. Call {c.phone} and dispatch will take your booking by phone. If you hit a barrier on this site,
          tell us at <a href={`mailto:${c.email}`} style={{ color: 'var(--steel)' }}>{c.email}</a> and we will fix it and help you in the meantime.</p>
        <p>This statement was last reviewed in October 2026.</p>
      </div></div></section>
    </>
  );
}
