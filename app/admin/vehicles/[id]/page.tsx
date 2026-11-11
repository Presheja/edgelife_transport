import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { BOOKING_STATUSES, OPEN_STATUSES, fmtDate, fmtTime, label, MOBILITY, type Booking, type Driver } from '@/lib/admin-constants';
import { LOG_KINDS, VEHICLE_STATUSES, VEHICLE_TYPES, vehicleAlerts, type Vehicle, type VehicleLog } from '@/lib/vehicles';
import AdminVehicleFields from '@/components/admin/VehicleForm';
import { updateVehicle, deleteVehicle, addVehicleLog, deleteVehicleLog } from '../../actions';

export const metadata = { title: 'Vehicle' };

const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function VehicleDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string; kind?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error, kind } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = serviceDb()!;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const [{ data }, { data: logData }, { data: rideData }, { data: drv }] = await Promise.all([
    db.from('vehicles').select('*').eq('id', id).maybeSingle(),
    db.from('vehicle_logs').select('*').eq('vehicle_id', id).order('log_date', { ascending: false }).order('created_at', { ascending: false }).limit(300),
    db.from('bookings').select('*').eq('vehicle_id', id).gte('ride_date', today).in('status', OPEN_STATUSES)
      .order('ride_date').order('ride_time').limit(50),
    db.from('drivers').select('*').order('name'),
  ]);
  if (!data) notFound();
  const v = data as Vehicle;
  const logs = (logData || []) as VehicleLog[];
  const rides = (rideData || []) as Booking[];
  const drivers = (drv || []) as Driver[];
  const driver = drivers.find(d => d.id === v.driver_id);

  const oil = logs.filter(l => l.kind === 'oil_change' && l.mileage != null);
  const lastOil = oil.length ? Math.max(...oil.map(l => l.mileage!)) : null;
  const nextOil = lastOil != null ? lastOil + v.oil_interval : null;
  const alerts = vehicleAlerts(v, lastOil);
  const year = today.slice(0, 4);
  const spentYear = logs.filter(l => l.log_date.startsWith(year)).reduce((s, l) => s + (Number(l.cost) || 0), 0);
  const spentAll = logs.reduce((s, l) => s + (Number(l.cost) || 0), 0);
  const fuel = logs.filter(l => l.kind === 'fuel' && l.log_date.startsWith(year)).reduce((s, l) => s + (Number(l.cost) || 0), 0);

  return (
    <>
      <p className="sub" style={{ marginBottom: 6 }}><Link href="/admin/vehicles" style={{ color: 'var(--steel)' }}>&larr; Vehicles</Link></p>
      <h1>{v.name} <span className={`pill ${v.status}`} style={{ verticalAlign: 'middle' }}>{label(VEHICLE_STATUSES, v.status)}</span></h1>
      <p className="sub">
        {[v.year, v.make, v.model].filter(Boolean).join(' ') || label(VEHICLE_TYPES, v.type)}
        {v.plate && ` · ${v.plate}`}{' · '}
        {v.wheelchair_positions > 0 ? `${v.wheelchair_positions} wheelchair position${v.wheelchair_positions === 1 ? '' : 's'}` : 'No wheelchair positions'}
        {' · '}{driver ? <>Driven by <Link href={`/admin/drivers/${driver.id}`} style={{ color: 'var(--steel)', fontWeight: 600 }}>{driver.name}</Link></> : 'Pool vehicle'}
      </p>

      {saved === '1' && <div className="flash good">Saved.</div>}
      {saved === 'log' && <div className="flash good">Log entry added.</div>}
      {saved === 'removed' && <div className="flash good">Log entry removed.</div>}
      {error && <div className="flash bad">{error === 'required' ? 'Give the vehicle a unit name.' : error === 'confirm' ? 'Tick the box to confirm.' : error === 'mileage' ? 'An odometer reading needs the mileage.' : 'Could not save. Try again.'}</div>}
      {alerts.map(a => <div key={a.text} className={`flash ${a.level === 'bad' ? 'bad' : 'warn'}`}>{a.text}</div>)}

      <div className="adm-grid">
        <div className="stat"><b className="sm">{v.mileage.toLocaleString()}</b><span>Odometer (mi)</span></div>
        <div className="stat"><b className="sm">{nextOil != null ? nextOil.toLocaleString() : '—'}</b>
          <span>Next oil change</span><small>{nextOil != null ? `${(nextOil - v.mileage).toLocaleString()} mi to go` : 'Log an oil change to start tracking'}</small></div>
        <div className="stat"><b className="sm">{v.inspection_expires ? fmtDate(v.inspection_expires) : '—'}</b><span>Inspection due</span></div>
        <div className="stat"><b className="sm">{money(spentYear)}</b><span>Spent in {year}</span><small>{fuel ? `${money(fuel)} of it fuel · ` : ''}{money(spentAll)} all time</small></div>
      </div>

      <div className="two-col">
        <form action={addVehicleLog} className="adm-card" id="log">
          <h2>Add to the log</h2>
          <input type="hidden" name="vehicle_id" value={v.id} />
          <div className="f-grid">
            <div className="fld"><label htmlFor="kind">What happened</label>
              <select id="kind" name="kind" defaultValue={kind || 'mileage'}>
                {LOG_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select></div>
            <div className="fld"><label htmlFor="log_date">Date</label>
              <input id="log_date" name="log_date" type="date" defaultValue={today} /></div>
            <div className="fld"><label htmlFor="l-mileage">Odometer</label>
              <input id="l-mileage" name="mileage" inputMode="numeric" placeholder={String(v.mileage)} /></div>
            <div className="fld"><label htmlFor="cost">Cost ($)</label>
              <input id="cost" name="cost" inputMode="decimal" /></div>
            <div className="fld full"><label htmlFor="vendor">Shop / vendor</label>
              <input id="vendor" name="vendor" placeholder="e.g. Taunton Ford, Shell on Rt 44" /></div>
            <div className="fld full"><label htmlFor="description">Details</label>
              <textarea id="description" name="description" placeholder="Front pads and rotors replaced. Lift cycled 10x, no faults." /></div>
            <div className="fld"><label htmlFor="next_due_date">Next due (date)</label>
              <input id="next_due_date" name="next_due_date" type="date" />
              <small>For inspections and lift service, this updates the due date above.</small></div>
            <div className="fld"><label htmlFor="next_due_mileage">Next due (miles)</label>
              <input id="next_due_mileage" name="next_due_mileage" inputMode="numeric" /></div>
          </div>
          <div className="row-btn"><button className="abtn pri" type="submit">Add entry</button></div>
        </form>

        <div>
          <h2>Upcoming rides</h2>
          <div className="tbl-wrap">
            {rides.length === 0 ? <div className="empty">No rides booked on this vehicle.</div> : (
              <table className="tbl"><thead><tr><th>When</th><th>Rider</th><th>Status</th></tr></thead><tbody>
                {rides.map(b => (
                  <tr key={b.id}>
                    <td>{b.ride_date === today ? 'Today' : fmtDate(b.ride_date)}<small>{fmtTime(b.ride_time) || 'Time TBD'}</small></td>
                    <td><Link className="row" href={`/admin/bookings/${b.id}`}>{b.rider_name}</Link><small>{label(MOBILITY, b.mobility)}{b.driver ? ` · ${b.driver}` : ''}</small></td>
                    <td><span className={`pill ${b.status}`}>{label(BOOKING_STATUSES, b.status)}</span></td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 8 }}>Log history</h2>
      <div className="tbl-wrap" style={{ marginBottom: 28 }}>
        {logs.length === 0 ? <div className="empty">Nothing logged yet. Start with today&rsquo;s odometer reading.</div> : (
          <table className="tbl"><thead><tr><th>Date</th><th>Entry</th><th>Odometer</th><th>Cost</th><th>Next due</th><th></th></tr></thead><tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>{fmtDate(l.log_date)}<small>{l.created_by?.split('@')[0]}</small></td>
                <td><b>{label(LOG_KINDS, l.kind)}</b>{l.vendor && <small>{l.vendor}</small>}{l.description && <small style={{ whiteSpace: 'pre-wrap' }}>{l.description}</small>}</td>
                <td>{l.mileage != null ? l.mileage.toLocaleString() : ''}</td>
                <td>{l.cost != null ? money(Number(l.cost)) : ''}</td>
                <td>{l.next_due_date ? fmtDate(l.next_due_date) : ''}{l.next_due_mileage ? <small>{l.next_due_mileage.toLocaleString()} mi</small> : null}</td>
                <td>
                  <form action={deleteVehicleLog}>
                    <input type="hidden" name="id" value={l.id} /><input type="hidden" name="vehicle_id" value={v.id} />
                    <button type="submit" className="abtn danger" style={{ padding: '4px 12px', fontSize: '.8rem' }} aria-label="Remove this log entry">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>

      <h2>Vehicle details</h2>
      <form action={updateVehicle} className="adm-card">
        <input type="hidden" name="id" value={v.id} />
        <AdminVehicleFields v={v} drivers={drivers} />
        <div className="row-btn"><button className="abtn pri" type="submit">Save changes</button></div>
      </form>
      <details className="del">
        <summary>Delete this vehicle</summary>
        <form action={deleteVehicle} className="adm-card">
          <input type="hidden" name="id" value={v.id} />
          <p style={{ marginBottom: 12 }}>This deletes the vehicle and its whole log. To keep the history, set the status to Retired instead.</p>
          <label className="chk-row"><input type="checkbox" name="confirm" value="yes" /> Yes, delete it and its log permanently</label>
          <div className="row-btn"><button className="abtn danger" type="submit">Delete vehicle</button></div>
        </form>
      </details>
    </>
  );
}
