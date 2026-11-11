import PageHead from '@/components/PageHead';
import { getCompany } from '@/lib/settings';

export const metadata = { title: 'Terms of Use' };

export default async function Page() {
  const c = await getCompany();
  return (
    <>
      <PageHead title="Terms of Use" intro="The ground rules for using this website. Last updated October 2026." />
      <section><div className="wrap"><div className="prose">
        <h2 style={{ fontSize: '1.5rem', marginTop: 8 }}>Using this website</h2>
        <p>This website is provided by {c.name}, LLC to share information about our transportation services and to let you request a ride or apply to drive.
          By using it you agree to these terms. If you do not agree, please call us instead.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Estimates and ride requests</h2>
        <p>The estimate calculator and the published rates give a good idea of the price, but they are not a binding quote. A ride request is only a request.
          A ride is booked when dispatch confirms the price, date and time with you. Distances in the calculator are approximate, and trips that include long waits,
          extra stops or unusual circumstances are quoted by dispatch.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Not for emergencies</h2>
        <p>We provide non-emergency transportation. In an emergency, call 911.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Accuracy</h2>
        <p>We work to keep the information here correct and current, including rates, service areas and hours, but it can change. If something on the site
          differs from what dispatch tells you, what dispatch confirms for your ride applies.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Acceptable use</h2>
        <p>Please give accurate information, and do not use the forms to send spam, harmful code, or anything unlawful. We may block access that puts the site or our customers at risk.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Ownership</h2>
        <p>The text, design, logos and photographs on this site belong to {c.name}, LLC or are used with permission. Please ask before reusing them.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Limits and governing law</h2>
        <p>The website is provided as is. To the extent the law allows, we are not liable for losses arising from use of the website itself, apart from our responsibilities for a ride we have confirmed with you.
          These terms are governed by the laws of the Commonwealth of Massachusetts.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Contact</h2>
        <p>Questions? Email <a href={`mailto:${c.email}`} style={{ color: 'var(--steel)' }}>{c.email}</a> or call {c.phone}.</p>
      </div></div></section>
    </>
  );
}
