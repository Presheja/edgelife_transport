export const BOOKING_STATUSES = [
  { id: 'new',       label: 'New' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'assigned',  label: 'Assigned' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'no_show',   label: 'No-show' },
] as const;

export const APPLICATION_STATUSES = [
  { id: 'new',       label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'screening', label: 'Screening' },
  { id: 'hired',     label: 'Hired' },
  { id: 'declined',  label: 'Declined' },
] as const;

export const MOBILITY = [
  { id: 'ambulatory', label: 'Walks on their own' },
  { id: 'walker',     label: 'Walker or cane' },
  { id: 'wheelchair', label: 'Stays in a wheelchair' },
  { id: 'powerchair', label: 'Power chair or scooter' },
] as const;

export const TRIP_TYPES = [
  { id: 'round',  label: 'Round trip' },
  { id: 'one',    label: 'One way' },
  { id: 'weekly', label: 'Recurring weekly' },
] as const;

export const label = (list: readonly { id: string; label: string }[], id?: string | null) =>
  list.find(x => x.id === id)?.label ?? (id || '');

export interface Booking {
  id: string; created_at: string; updated_at: string; source: string; status: string;
  rider_name: string; rider_phone: string; mobility: string | null; memory_loss: boolean;
  pickup: string | null; dropoff: string | null; ride_date: string | null; ride_time: string | null;
  trip_type: string | null; contact_name: string | null; relationship: string | null; email: string | null;
  payment: string | null; notes: string | null; quoted_price: number | null; driver: string | null;
  vehicle: string | null; internal_notes: string | null;
}

export interface Application {
  id: string; created_at: string; status: string; name: string; phone: string; email: string | null;
  town: string | null; license: string | null; years: string | null; wheelchair_exp: string | null;
  availability: string | null; consent_screening: boolean; notes: string | null; internal_notes: string | null;
}

export const fmtDate = (d?: string | null) => d ? new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
export const fmtTime = (t?: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
export const fmtStamp = (d: string) => new Date(d).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
