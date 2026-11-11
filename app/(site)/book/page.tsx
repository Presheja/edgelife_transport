import type { Metadata } from 'next';
import BookingSection from '@/components/BookingSection';
import { getCompany, getRates } from '@/lib/settings';
import { quote } from '@/lib/rates';
import { money } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Book a Ride',
  description: 'Request a wheelchair van or ambulatory ride in Taunton and Southeastern Massachusetts. Dispatch confirms your price before the ride is booked.',
};

export default async function Book({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [company, rates, params] = await Promise.all([getCompany(), getRates(), searchParams]);
  const value = (key: string) => typeof params[key] === 'string' ? (params[key] as string).slice(0, 300) : '';
  const mobility = value('mobility') === 'wheelchair' ? 'wheelchair' : 'ambulatory';
  const tripType = value('tripType') === 'one' ? 'one' : 'round';
  const miles = Number(value('miles'));
  const hasEstimate = value('miles') !== '' && Number.isFinite(miles) && miles >= 0 && miles <= 200;
  const estimate = hasEstimate ? quote(rates, { level: mobility, miles, roundTrip: tripType === 'round' }) : null;
  return <BookingSection company={company} initial={{
    mobility, tripType, pickup: value('pickup'),
    notes: estimate ? `Requested estimate: ${money(estimate.total)}; ${mobility}; ${miles} miles one way; ${tripType === 'round' ? 'round trip' : 'one way'}. Destination area: ${value('destination')}. Dispatch must confirm the final price.` : '',
  }} />;
}
