/* Everything on the public site that changes routinely is read from here.
   Source of truth: the Supabase `settings` and `testimonials` tables, edited in
   the admin area. The defaults below are used when Supabase is not configured
   or cannot be reached, so the public site always renders. */
import { unstable_cache } from 'next/cache';
import { serviceDb } from '@/lib/supabase/admin';
import { DEFAULT_RATES, type Rates } from '@/lib/rates';

export interface Company {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  /** Short line in the top bar of the site. Leave empty to hide. */
  announcement: string;
  /** What we tell people after they submit the booking form. */
  responseTime: string;
  coreTowns: string[];
  extendedTowns: string[];
  url: string;
}

export const DEFAULT_COMPANY: Company = {
  name: 'EdgeLIFE Transportation',
  tagline: 'Driven by care. Guided by trust.',
  phone: '(508) 499-1799',
  email: 'info@edgelifetransport.com',
  street: '135 Washington St, STE 201',
  city: 'Taunton',
  state: 'MA',
  zip: '02780',
  hours: 'Mon–Fri 6am–8pm · Sat–Sun 7am–6pm',
  announcement: 'Book ahead for the best availability',
  responseTime: 'the same business day',
  coreTowns: [
    'Taunton', 'Raynham', 'Berkley', 'Dighton', 'Easton', 'Norton', 'Mansfield',
    'Lakeville', 'Middleborough', 'Bridgewater', 'East Bridgewater', 'West Bridgewater',
    'Brockton', 'Avon', 'Whitman', 'Attleboro', 'North Attleborough', 'Foxborough', 'Plainville',
  ],
  extendedTowns: [
    'Fall River', 'New Bedford', 'Dartmouth', 'Fairhaven', 'Acushnet', 'Somerset', 'Swansea',
    'Seekonk', 'Westport', 'Wrentham', 'Bellingham', 'Carver', 'Halifax', 'Hanson', 'Hanover',
    'Duxbury', 'Boston', 'Providence, RI',
  ],
  url: process.env.SITE_URL || 'https://www.edgelifetransportation.com',
};

export interface Testimonial { id: string; name: string; role: string; quote: string }

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const db = serviceDb();
  if (!db) return fallback;
  try {
    const { data, error } = await db.from('settings').select('value').eq('key', key).maybeSingle();
    if (error || !data?.value) return fallback;
    return { ...(fallback as object), ...(data.value as object) } as T;
  } catch {
    return fallback;
  }
}

export const getCompany = unstable_cache(
  async (): Promise<Company> => readSetting<Company>('company', DEFAULT_COMPANY),
  ['company-settings'],
  { revalidate: 60, tags: ['settings'] },
);

export const getRates = unstable_cache(
  async (): Promise<Rates> => readSetting<Rates>('rates', DEFAULT_RATES),
  ['rate-settings'],
  { revalidate: 60, tags: ['settings'] },
);

export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const db = serviceDb();
    if (!db) return [];
    try {
      const { data, error } = await db
        .from('testimonials')
        .select('id,name,role,quote')
        .eq('published', true)
        .order('sort', { ascending: true })
        .limit(6);
      if (error || !data) return [];
      return data as Testimonial[];
    } catch {
      return [];
    }
  },
  ['testimonials'],
  { revalidate: 60, tags: ['settings'] },
);
