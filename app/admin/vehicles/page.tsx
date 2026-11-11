import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { label } from '@/lib/admin-constants';
import { VEHICLE_STATUSES, VEHICLE_TYPES, vehicleAlerts, type Vehicle } from '@/lib/vehicles';

export const metadata = { title: 'Vehicles' };

export default async function Vehicles({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdmin();
  const { show } = await searchParams;
  const db = serviceDb()!;
  let q = db.from('vehicles').select('*').order('name');
  if (show === 'retired') q = q.eq('status', 'retired');
  else if (show !== 'all') q = q.neq('status', 'retired');
  const [{ data }, { data: drv }, { data: oil }] = await Promise.all([
    q,
    db.from('drivers').select('id, name'),
    db.from('vehicle_logs').select('vehicle_id, mileage').eq('kind', 'oil_change'),
  ]);
  const rows = (data || []) as Vehicle[];
  const names = new Map((drv || []).map(d => [d.id as string, d.name as string]));
  const lastOil = new Map<string, number>();
  for (const r of oil || []) if (r.mileage != null) lastOil.set(r.vehicle_id, Math.max(lastOil.get(r.vehicle_id) ?? 0, r.mileage));
  const withAlerts = rows.map(v => ({ v, alerts: vehicleAlerts(v, lastOil.get(v.id) ?? null) }));
  const attention = show === 'attention';
  const list = attention ? withAlerts.filter(x => x.alerts.length) : withAlerts;
  const inService = rows.filter(v => v.status === 'active');

  return (
    <>
      <h1>Vehicles</h1>
      <p className="sub">The fleet: who drives what, what&rsquo;s due, and what it costs to keep on the road.</p>
      <div className="adm-grid">
        <div className="stat"><b>{inService.length}</b><span>In service</span></div>
        <div className="stat"><b>{inService.filter(v => v.wheelchair_positions > 0).length}</b><span>Can take a wheelchair</span></div>
        <Link href="/admin/vehicles?show=attention" className={`stat${withAlerts.some(x => x.alerts.length) ? ' hot' : ''}`}>
          <b>{withAlerts.filter(x => x.alerts.length).length}</b><span>Need attention</span></Link>
      </div>
      <div className="filters">
        <Link href="/admin/vehicles" className={!show ? 'on' : ''}>Fleet</Link>
        <Link href="/admin/vehicles?show=attention" className={attention ? 'on' : ''}>Needs attention</Link>
        <Link href="/admin/vehicles?show=retired" className={show === 'retired' ? 'on' : ''}>Retired</Link>
      </div>
      <div className="tbl-wrap">
        {list.length === 0 ? <div className="empty">{attention ? 'Nothing due. Nice.' : 'No vehicles yet. Add your first one.'}</div> : (
          <table className="tbl"><thead><tr><th>Vehicle</th><th>Capacity</th><th>Driver</th><th>Odometer</th><th>Attention</th><th>Status</th></tr></thead><tbody>
            {list.map(({ v, alerts }) => (
              <tr key={v.id}>
                <td><Link className="row" href={`/admin/vehicles/${v.id}`}>{v.name}</Link>
                  <small>{[v.year, v.make, v.model].filter(Boolean).join(' ') || label(VEHICLE_TYPES, v.type)}{v.plate ? ` · ${v.plate}` : ''}</small></td>
                <td>{v.seats ?? '?'} seats<small>{v.wheelchair_positions > 0 ? `${v.wheelchair_positions} wheelchair` : 'No wheelchair'}</small></td>
                <td>{v.driver_id ? <Link className="row" href={`/admin/drivers/${v.driver_id}`}>{names.get(v.driver_id) ?? 'Driver'}</Link> : <small>Pool</small>}</td>
                <td>{v.mileage.toLocaleString()} mi</td>
                <td>{alerts.length ? <div className="pills">{alerts.map(a => <span key={a.text} className={`pill ${a.level}`}>{a.text}</span>)}</div> : <span className="pill ok">All good</span>}</td>
                <td><span className={`pill ${v.status}`}>{label(VEHICLE_STATUSES, v.status)}</span></td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
      <div className="row-btn"><Link href="/admin/vehicles/new" className="abtn pri">Add vehicle</Link></div>
    </>
  );
}
