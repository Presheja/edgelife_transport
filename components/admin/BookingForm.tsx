import { BOOKING_STATUSES, MOBILITY, TRIP_TYPES, type Booking } from '@/lib/admin-constants';

/* Shared by "new booking" (dispatch taking a phone call) and "edit booking". */
export default function AdminBookingFields({ b }: { b?: Booking }) {
  return (
    <div className="f-grid">
      <div className="fld"><label htmlFor="rider_name">Rider name</label>
        <input id="rider_name" name="rider_name" defaultValue={b?.rider_name} required /></div>
      <div className="fld"><label htmlFor="rider_phone">Rider phone</label>
        <input id="rider_phone" name="rider_phone" type="tel" defaultValue={b?.rider_phone} required /></div>
      <div className="fld"><label htmlFor="mobility">Mobility</label>
        <select id="mobility" name="mobility" defaultValue={b?.mobility ?? 'ambulatory'}>
          {MOBILITY.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
      <div className="fld"><label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={b?.status ?? 'confirmed'}>
          {BOOKING_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
      <div className="fld full"><label htmlFor="pickup">Pickup address</label>
        <input id="pickup" name="pickup" defaultValue={b?.pickup ?? ''} /></div>
      <div className="fld full"><label htmlFor="dropoff">Destination</label>
        <input id="dropoff" name="dropoff" defaultValue={b?.dropoff ?? ''} /></div>
      <div className="fld"><label htmlFor="ride_date">Date</label>
        <input id="ride_date" name="ride_date" type="date" defaultValue={b?.ride_date ?? ''} /></div>
      <div className="fld"><label htmlFor="ride_time">Pickup time</label>
        <input id="ride_time" name="ride_time" type="time" defaultValue={b?.ride_time?.slice(0, 5) ?? ''} /></div>
      <div className="fld"><label htmlFor="trip_type">Trip type</label>
        <select id="trip_type" name="trip_type" defaultValue={b?.trip_type ?? 'round'}>
          {TRIP_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
      <div className="fld"><label htmlFor="payment">Payment</label>
        <input id="payment" name="payment" defaultValue={b?.payment ?? 'Private pay'} /></div>
      <div className="fld"><label htmlFor="quoted_price">Quoted price ($)</label>
        <input id="quoted_price" name="quoted_price" inputMode="decimal" defaultValue={b?.quoted_price ?? ''} /></div>
      <div className="fld"><label htmlFor="driver">Driver</label>
        <input id="driver" name="driver" defaultValue={b?.driver ?? ''} /></div>
      <div className="fld"><label htmlFor="vehicle">Vehicle</label>
        <input id="vehicle" name="vehicle" defaultValue={b?.vehicle ?? ''} placeholder="e.g. W#6" /></div>
      <div className="fld"><label htmlFor="contact_name">Contact name</label>
        <input id="contact_name" name="contact_name" defaultValue={b?.contact_name ?? ''} /></div>
      <div className="fld"><label htmlFor="relationship">Relationship to rider</label>
        <input id="relationship" name="relationship" defaultValue={b?.relationship ?? ''} /></div>
      <div className="fld"><label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={b?.email ?? ''} /></div>
      <div className="fld full"><label className="chk-row"><input type="checkbox" name="memory_loss" defaultChecked={b?.memory_loss} />
        Rider has memory loss or dementia</label></div>
      <div className="fld full"><label htmlFor="notes">Notes from the customer</label>
        <textarea id="notes" name="notes" defaultValue={b?.notes ?? ''} /></div>
      <div className="fld full"><label htmlFor="internal_notes">Internal notes (never shown to customers)</label>
        <textarea id="internal_notes" name="internal_notes" defaultValue={b?.internal_notes ?? ''} /></div>
    </div>
  );
}
