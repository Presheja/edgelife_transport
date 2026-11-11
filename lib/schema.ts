/* Structured data (schema.org) for EdgeLIFE Transport. Every page points back to the
   same business record (@id), so search engines see one consistent business:
   one name, one Taunton address, one phone. */
import type { Company } from '@/lib/settings';
import type { Rates } from '@/lib/rates';
import { BRAND, OPENING_HOURS, SITE_URL, abs } from '@/lib/site';

export const BUSINESS_ID = SITE_URL + '/#business';
export const WEBSITE_ID = SITE_URL + '/#website';

export function businessGraph(company: Company, rates: Rates) {
  const towns = Array.from(new Set(company.coreTowns.length ? company.coreTowns : ['Taunton']));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: BRAND,
        publisher: { '@id': BUSINESS_ID },
        inLanguage: 'en-US',
      },
      {
        '@type': 'LocalBusiness',
        '@id': BUSINESS_ID,
        name: BRAND,
        description: 'Private-pay wheelchair-accessible and ambulatory transportation in Taunton and Southeastern Massachusetts, with published rates, screened drivers and vans inspected before every shift.',
        url: SITE_URL,
        telephone: company.phone,
        email: company.email,
        logo: abs('/img/logo.png'),
        image: [abs('/img/van-ramp.jpg'), abs('/img/fleet-accessible.png')],
        address: {
          '@type': 'PostalAddress',
          streetAddress: company.street,
          addressLocality: company.city,
          addressRegion: company.state,
          postalCode: company.zip,
          addressCountry: 'US',
        },
        openingHoursSpecification: OPENING_HOURS.map(h => ({
          '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes,
        })),
        areaServed: towns.map(t => ({ '@type': 'City', name: t.includes(',') ? t : `${t}, MA` })),
        priceRange: `$${Math.round(rates.ambulatory.base)}–$${Math.round(rates.wheelchair.base)}+ per ride`,
        paymentAccepted: 'Private pay',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Ride rates',
          itemListElement: [
            { key: 'wheelchair', label: 'Wheelchair-accessible van ride' },
            { key: 'ambulatory', label: 'Ambulatory ride' },
          ].map(({ key, label }) => {
            const r = rates[key as 'wheelchair' | 'ambulatory'];
            return {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: label, provider: { '@id': BUSINESS_ID } },
              priceSpecification: {
                '@type': 'PriceSpecification', priceCurrency: 'USD', price: r.base,
                description: `Base fare includes the first ${r.includedMiles} miles, then $${r.perMile.toFixed(2)} per additional mile.`,
              },
              url: abs('/pricing'),
            };
          }),
        },
      },
    ],
  };
}

/** Breadcrumbs from the visible crumb trail. The last item is the current page. */
export function breadcrumbGraph(crumbs: { href: string; label: string }[], current?: string) {
  const items = [{ href: '/', label: 'Home' }, ...crumbs];
  const list = items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: abs(c.href) }));
  if (current && current !== crumbs[crumbs.length - 1]?.label) list.push({ '@type': 'ListItem', position: list.length + 1, name: current } as typeof list[number]);
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list };
}

export function serviceGraph(s: { slug: string; title: string; short: string }, company: Company) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': abs(`/services/${s.slug}`) + '#service',
    name: s.title,
    description: s.short,
    serviceType: 'Non-emergency medical transportation',
    provider: { '@id': BUSINESS_ID },
    areaServed: (company.coreTowns.length ? company.coreTowns : ['Taunton']).map(t => ({ '@type': 'City', name: t.includes(',') ? t : `${t}, MA` })),
    url: abs(`/services/${s.slug}`),
  };
}

export function faqGraph(items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}
