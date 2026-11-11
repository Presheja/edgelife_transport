/* ============================================================================
   RATES
   ----------------------------------------------------------------------------
   The numbers below are only the DEFAULTS. Live rates are stored in Supabase
   and edited in the admin area (Admin → Rates). If the database is not
   reachable the site falls back to these, so the pricing page never breaks.

   Pricing model (confirmed by leadership, 26 Aug 2026):
     Wheelchair   $100 base, includes the first 5 miles, then $2.50 per mile
     Ambulatory   $50  base, includes the first 5 miles, then $1.50 per mile
   "Ambulatory" describes the rider (walks, with or without a cane or walker,
   and sits in a regular seat). "Wheelchair" means the rider stays in their
   chair and rides in an accessible van.
   ========================================================================== */

export type LevelId = 'ambulatory' | 'wheelchair';

export interface LevelRate { base: number; includedMiles: number; perMile: number }
export interface Rates {
  ambulatory: LevelRate;
  wheelchair: LevelRate;
  /** One-line note shown under the rates, e.g. about long trips. */
  note: string;
}

export const DEFAULT_RATES: Rates = {
  ambulatory: { base: 50, includedMiles: 5, perMile: 1.5 },
  wheelchair: { base: 100, includedMiles: 5, perMile: 2.5 },
  note: 'Trips beyond our core service area, including Boston and Providence, are quoted individually before you book.',
};

/** Incomplete saved settings must not turn a public estimate into NaN. */
export function normalizeRates(value: unknown): Rates {
  const saved = value && typeof value === 'object' ? value as Partial<Rates> : {};
  const level = (id: LevelId): LevelRate => {
    const source = saved[id];
    const number = (key: keyof LevelRate) => {
      const v = source?.[key];
      return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : DEFAULT_RATES[id][key];
    };
    return { base: number('base'), includedMiles: number('includedMiles'), perMile: number('perMile') };
  };
  return { ambulatory: level('ambulatory'), wheelchair: level('wheelchair'), note: typeof saved.note === 'string' ? saved.note : DEFAULT_RATES.note };
}

export interface Level extends LevelRate {
  id: LevelId;
  name: string;
  blurb: string;
  featured?: boolean;
  includes: string[];
}

export function buildLevels(r: Rates): Level[] {
  return [
    {
      id: 'ambulatory',
      name: 'Ambulatory',
      blurb: 'Riders who can walk, with or without a cane or walker, and sit in a regular seat.',
      ...r.ambulatory,
      includes: [
        `First ${r.ambulatory.includedMiles} miles included`,
        'Door-to-door help with coats, bags and walkers',
        'Folding walker or chair travels in the trunk',
      ],
    },
    {
      id: 'wheelchair',
      name: 'Wheelchair',
      blurb: 'Riders who stay in their wheelchair, power chair or scooter. Accessible van with four-point securement.',
      ...r.wheelchair,
      featured: true,
      includes: [
        `First ${r.wheelchair.includedMiles} miles included`,
        'Roll on, roll off. No transfers, no lifting',
        'Door-through-door assistance',
      ],
    },
  ];
}

/* Approximate one-way distances from Taunton, so a visitor gets a number
   without a maps API. The calculator lets them type their own mileage. */
export const DESTINATIONS = [
  { id: 'taunton',  label: 'Within Taunton',                                       miles: 4 },
  { id: 'nearby',   label: 'Raynham, Berkley, Dighton, Lakeville, Norton, Easton', miles: 8 },
  { id: 'regional', label: 'Brockton, Attleboro, Middleborough, Bridgewater',      miles: 15 },
  { id: 'coast',    label: 'Fall River or New Bedford',                            miles: 22 },
  { id: 'prov',     label: 'Providence, RI',                                       miles: 30 },
  { id: 'boston',   label: 'Boston hospitals (Longwood, MGH, BMC)',                miles: 40 },
];

export interface QuoteInput { level: LevelId; miles: number; roundTrip: boolean }
export interface QuoteLine { label: string; amount: number }
export interface Quote { lines: QuoteLine[]; total: number; oneWay: number }

/** The one and only place a price is computed. */
export function quote(rates: Rates, input: QuoteInput): Quote {
  const r = rates[input.level];
  const miles = Math.max(0, input.miles || 0);
  const extra = Math.max(0, miles - r.includedMiles);
  const extraCost = Math.round(extra * r.perMile * 100) / 100;
  const oneWay = r.base + extraCost;

  const lines: QuoteLine[] = [
    { label: `Base fare (includes first ${r.includedMiles} miles)`, amount: r.base },
  ];
  if (extra > 0) {
    lines.push({ label: `Additional miles · ${Math.round(extra * 10) / 10} mi`, amount: extraCost });
  }
  if (input.roundTrip) {
    lines.push({ label: 'Return trip, priced the same', amount: oneWay });
  }
  return { lines, total: input.roundTrip ? oneWay * 2 : oneWay, oneWay };
}
