import { VEHICLE_STATUSES, VEHICLE_TYPES, type Vehicle } from '@/lib/vehicles';
import type { Driver } from '@/lib/admin-constants';

/* Shared by "add vehicle" and "edit vehicle". */
export default function AdminVehicleFields({ v, drivers = [] }: { v?: Vehicle; drivers?: Driver[] }) {
  const options = drivers.filter(d => d.status === 'active' || d.id === v?.driver_id);
  return (
    <div className="f-grid">
      <div className="fld"><label htmlFor="name">Unit name</label>
        <input id="name" name="name" defaultValue={v?.name} placeholder="e.g. W#6" required />
        <small>What dispatch calls it on the radio.</small></div>
      <div className="fld"><label htmlFor="type">Type</label>
        <select id="type" name="type" defaultValue={v?.type ?? 'wheelchair_van'}>
          {VEHICLE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
      <div className="fld"><label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={v?.status ?? 'active'}>
          {VEHICLE_STATUSES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
      <div className="fld"><label htmlFor="driver_id">Assigned driver</label>
        <select id="driver_id" name="driver_id" defaultValue={v?.driver_id ?? ''}>
          <option value="">Pool vehicle (no one assigned)</option>
          {options.map(d => <option key={d.id} value={d.id}>{d.name}{d.wheelchair_trained ? ' · wheelchair trained' : ''}</option>)}
        </select>
        <small>A driver has one vehicle. Assigning here frees them from any other.</small></div>
      <div className="fld"><label htmlFor="year">Year</label><input id="year" name="year" inputMode="numeric" defaultValue={v?.year ?? ''} /></div>
      <div className="fld"><label htmlFor="make">Make</label><input id="make" name="make" defaultValue={v?.make ?? ''} placeholder="Ford" /></div>
      <div className="fld"><label htmlFor="model">Model</label><input id="model" name="model" defaultValue={v?.model ?? ''} placeholder="Transit 350" /></div>
      <div className="fld"><label htmlFor="color">Color</label><input id="color" name="color" defaultValue={v?.color ?? ''} /></div>
      <div className="fld"><label htmlFor="plate">Plate</label><input id="plate" name="plate" defaultValue={v?.plate ?? ''} /></div>
      <div className="fld"><label htmlFor="vin">VIN</label><input id="vin" name="vin" defaultValue={v?.vin ?? ''} maxLength={17} /></div>
      <div className="fld"><label htmlFor="seats">Passenger seats</label><input id="seats" name="seats" inputMode="numeric" defaultValue={v?.seats ?? ''} /></div>
      <div className="fld"><label htmlFor="wheelchair_positions">Wheelchair positions</label>
        <input id="wheelchair_positions" name="wheelchair_positions" inputMode="numeric" defaultValue={v?.wheelchair_positions ?? 0} />
        <small>0 means this vehicle cannot take a rider who stays in their chair.</small></div>
      <div className="fld"><label htmlFor="mileage">Odometer (miles)</label>
        <input id="mileage" name="mileage" inputMode="numeric" defaultValue={v?.mileage ?? 0} />
        <small>Log readings below and this updates itself.</small></div>
      <div className="fld"><label htmlFor="oil_interval">Oil change every (miles)</label>
        <input id="oil_interval" name="oil_interval" inputMode="numeric" defaultValue={v?.oil_interval ?? 5000} /></div>
      <div className="fld"><label htmlFor="inspection_expires">State inspection due</label>
        <input id="inspection_expires" name="inspection_expires" type="date" defaultValue={v?.inspection_expires ?? ''} /></div>
      <div className="fld"><label htmlFor="registration_expires">Registration expires</label>
        <input id="registration_expires" name="registration_expires" type="date" defaultValue={v?.registration_expires ?? ''} /></div>
      <div className="fld"><label htmlFor="insurance_expires">Insurance expires</label>
        <input id="insurance_expires" name="insurance_expires" type="date" defaultValue={v?.insurance_expires ?? ''} /></div>
      <div className="fld"><label htmlFor="lift_service_due">Lift / ramp service due</label>
        <input id="lift_service_due" name="lift_service_due" type="date" defaultValue={v?.lift_service_due ?? ''} /></div>
      <div className="fld full"><label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" defaultValue={v?.notes ?? ''} placeholder="Quirks, keys location, warranty details..." /></div>
    </div>
  );
}
