/* Vehicles: shared labels, types and the "needs attention" rules used by
   the vehicle list, vehicle page, dashboard and sidebar badge. */

export const VEHICLE_TYPES = [
  { id: 'wheelchair_van', label: 'Wheelchair van (lift)' },
  { id: 'ramp_minivan',   label: 'Ramp minivan' },
  { id: 'minivan',        label: 'Minivan' },
  { id: 'sedan',          label: 'Sedan' },
  { id: 'suv',            label: 'SUV' },
] as const;

export const VEHICLE_STATUSES = [
  { id: 'active',         label: 'In service' },
  { id: 'in_shop',        label: 'In the shop' },
  { id: 'out_of_service', label: 'Out of service' },
  { id: 'retired',        label: 'Retired' },
] as const;

export const LOG_KINDS = [
  { id: 'mileage',     label: 'Odometer reading' },
  { id: 'oil_change',  label: 'Oil change' },
  { id: 'maintenance', label: 'Scheduled maintenance' },
  { id: 'brakes',      label: 'Brakes' },
  { id: 'tires',       label: 'Tires' },
  { id: 'lift',        label: 'Lift / ramp service' },
  { id: 'inspection',  label: 'State inspection' },
  { id: 'repair',      label: 'Repair' },
  { id: 'fuel',        label: 'Fuel' },
  { id: 'cleaning',    label: 'Deep clean' },
  { id: 'incident',    label: 'Incident / damage' },
] as const;

export interface Vehicle {
  id: string; created_at: string; name: string; type: string | null; make: string | null; model: string | null;
  year: number | null; plate: string | null; vin: string | null; color: string | null; seats: number | null;
  wheelchair_positions: number; status: string; mileage: number; driver_id: string | null; oil_interval: number;
  inspection_expires: string | null; registration_expires: string | null; insurance_expires: string | null;
  lift_service_due: string | null; notes: string | null;
}

export interface VehicleLog {
  id: string; created_at: string; vehicle_id: string; kind: string; log_date: string; mileage: number | null;
  cost: number | null; vendor: string | null; description: string | null; next_due_date: string | null;
  next_due_mileage: number | null; created_by: string | null;
}

export const wheelchairCapable = (v: Pick<Vehicle, 'wheelchair_positions'>) => (v.wheelchair_positions ?? 0) > 0;

export const vehicleTitle = (v: Pick<Vehicle, 'name' | 'year' | 'make' | 'model'>) =>
  [v.name, [v.year, v.make, v.model].filter(Boolean).join(' ')].filter(Boolean).join(' · ');

const todayET = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const daysUntil = (d: string) => Math.round((new Date(d + 'T12:00:00').getTime() - new Date(todayET() + 'T12:00:00').getTime()) / 864e5);

export interface Alert { level: 'bad' | 'warn'; text: string }

/** What needs doing on this vehicle. lastOilMileage: odometer at the most recent oil change, if logged. */
export function vehicleAlerts(v: Vehicle, lastOilMileage: number | null): Alert[] {
  if (v.status === 'retired') return [];
  const out: Alert[] = [];
  if (v.status === 'out_of_service') out.push({ level: 'bad', text: 'Out of service' });
  if (v.status === 'in_shop') out.push({ level: 'warn', text: 'In the shop' });
  const dated: [string, string | null][] = [
    ['Inspection', v.inspection_expires], ['Registration', v.registration_expires],
    ['Insurance', v.insurance_expires], ['Lift service', v.lift_service_due],
  ];
  for (const [what, d] of dated) {
    if (!d) continue;
    const n = daysUntil(d);
    if (n < 0) out.push({ level: 'bad', text: `${what} overdue` });
    else if (n <= 30) out.push({ level: 'warn', text: `${what} due in ${n} day${n === 1 ? '' : 's'}` });
  }
  if (lastOilMileage != null && v.oil_interval > 0) {
    const left = lastOilMileage + v.oil_interval - v.mileage;
    if (left <= 0) out.push({ level: 'bad', text: `Oil change overdue by ${Math.abs(left).toLocaleString()} mi` });
    else if (left <= 500) out.push({ level: 'warn', text: `Oil change in ${left.toLocaleString()} mi` });
  }
  return out;
}
