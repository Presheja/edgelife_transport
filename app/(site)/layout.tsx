import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { AREAS } from '@/lib/content';
import { getCompany } from '@/lib/settings';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompany();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': company.url + '/#business',
    name: company.name,
    description: 'Wheelchair-accessible and ambulatory private-pay transportation in Taunton and Southeastern Massachusetts.',
    url: company.url,
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.street,
      addressLocality: company.city,
      addressRegion: company.state,
      postalCode: company.zip,
      addressCountry: 'US',
    },
    areaServed: AREAS.map(a => ({ '@type': 'City', name: `${a.town}, MA` })),
    priceRange: '$$',
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header company={company} />
      <main>{children}</main>
      <Footer company={company} />
      <Reveal />
    </>
  );
}
