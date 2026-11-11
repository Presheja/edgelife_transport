import { DRIVER_STATUSES, type Driver } from '@/lib/admin-constants';

/* Shared by "add driver" and "edit driver". */
export default function AdminDriverFields({ d }: { d?: Driver }) {
  return (
    <div className="f-grid">
      <div className="fld"><label htmlFor="name">Full name</label>
        <input id="name" name="name" defaultValue={d?.name} required /></div>
      <div className="fld"><label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" defaultValue={d?.phone} required /></div>
      <div className="fld"><label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={d?.email ?? ''} /></div>
      <div className="fld"><label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={d?.status ?? 'active'}>
          {DRIVER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
      <div className="fld"><label htmlFor="license_expires">License expires</label>
        <input id="license_expires" name="license_expires" type="date" defaultValue={d?.license_expires ?? ''} /></div>
      <div className="fld full"><label className="chk-row"><input type="checkbox" name="wheelchair_trained" defaultChecked={d?.wheelchair_trained} />
        Trained in wheelchair loading and securement</label></div>
      <div className="fld full"><label htmlFor="notes">Internal notes</label>
        <textarea id="notes" name="notes" defaultValue={d?.notes ?? ''} /></div>
    </div>
  );
}
