/* One source of truth for the site's public identity.
   EdgeLIFE Transport (edgelifetransport.com) is its own business, based in Taunton.
   It is deliberately NOT linked to edgelifetransportation.com (a separate Woburn business):
   different name, address, phone and domain, so search engines never merge the two. */

export const SITE_URL = (process.env.SITE_URL || 'https://edgelifetransport.com').replace(/\/+$/, '');
export const BRAND = 'EdgeLIFE Transport';

/* Pages that set their own Open Graph block must list the share image again: Next.js replaces, not merges. */
export const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'EdgeLIFE Transport wheelchair van, Taunton MA' };

export const abs = (path = '/') => SITE_URL + (path.startsWith('/') ? path : '/' + path);

/* Opening hours as structured data. Keep in step with the hours shown in Admin → Site settings. */
export const OPENING_HOURS = [
  { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '06:00', closes: '20:00' },
  { days: ['Saturday', 'Sunday'], opens: '07:00', closes: '18:00' },
];
