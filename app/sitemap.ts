import type { MetadataRoute } from 'next';
import { SERVICES, AREAS } from '@/lib/content';

const SITE = process.env.SITE_URL || 'https://www.edgelifetransportation.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const s = (p: string, priority: number) => ({ url: SITE + p, lastModified: now, priority });
  return [
    s('/', 1),
    s('/pricing', 0.9), s('/book', 0.9), s('/safety', 0.9),
    s('/services', 0.8), s('/fleet', 0.8), s('/service-areas', 0.8), s('/careers', 0.7),
    ...SERVICES.map(x => s(`/services/${x.slug}`, 0.8)),
    ...AREAS.map(x => s(`/service-areas/${x.slug}`, 0.7)),
  ];
}
