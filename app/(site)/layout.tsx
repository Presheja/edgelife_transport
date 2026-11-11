import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { getCompany, getRates } from '@/lib/settings';
import JsonLd from '@/components/JsonLd';
import { businessGraph } from '@/lib/schema';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompany();
  const rates = await getRates();
  return (
    <>
      <JsonLd data={businessGraph(company, rates)} />
      <Header company={company} />
      <main>{children}</main>
      <Footer company={company} />
      <Reveal />
    </>
  );
}
