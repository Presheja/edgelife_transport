'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { authClient } from '@/lib/supabase/server';
import { allowedEmails, requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { tooMany } from '@/lib/ratelimit';
import { str } from '@/lib/validate';
import { BOOKING_STATUSES, APPLICATION_STATUSES, DRIVER_STATUSES, NEEDS_WHEELCHAIR, OPEN_STATUSES } from '@/lib/admin-constants';
import { DEFAULT_COMPANY } from '@/lib/settings';
import { DEFAULT_RATES } from '@/lib/rates';
import { VEHICLE_TYPES, VEHICLE_STATUSES, LOG_KINDS } from '@/lib/vehicles';
import { FEEDBACK_STATUSES, creditName, creditRole } from '@/lib/feedback';
import { ORG_TYPES, SOURCE_STATUSES, TOUCH_KINDS, DECLINE_REASONS, PRE_ACTIVATION, suggestedFollowUp, todayET, addDays } from '@/lib/referrals';

function db() {
  const c = serviceDb();
  if (!c) throw new Error('Supabase is not configured');
  return c;
}
const ok = (list: readonly { id: string }[], v: string, fallback: string) => (list.some(x => x.id === v) ? v : fallback);
const num = (v: FormDataEntryValue | null) => {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const refreshSite = () => { revalidateTag('settings'); revalidatePath('/', 'layout'); };

/* ---------- auth ---------- */
export async function signIn(formData: FormData) {
  const ip = ((await headers()).get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (tooMany('login:' + ip, 8, 15 * 60 * 1000)) redirect('/admin/login?error=slow');
  const email = str(formData.get('email'), 200).toLowerCase();
  const password = String(formData.get('password') || '');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) redirect('/admin/login?error=config');
  if (!allowedEmails().includes(email)) redirect('/admin/login?error=invalid');
  const supabase = await authClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/admin/login?error=invalid');
  redirect('/admin');
}

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function changePassword(fd: FormData) {
  await requireAdmin();
  const password = String(fd.get('password') || '');
  if (password.length < 10) redirect('/admin/profile?error=short');
  if (password !== String(fd.get('confirm') || '')) redirect('/admin/profile?error=match');
  const supabase = await authClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect('/admin/profile?error=save');
  redirect('/admin/profile?saved=1');
}

/* ---------- bookings ---------- */
function bookingFields(fd: FormData) {
  const date = str(fd.get('ride_date'), 10);
  const time = str(fd.get('ride_time'), 5);
  return {
    status: ok(BOOKING_STATUSES, str(fd.get('status'), 20), 'new'),
    rider_name: str(fd.get('rider_name'), 120),
    rider_phone: str(fd.get('rider_phone'), 40),
    mobility: str(fd.get('mobility'), 40) || null,
    memory_loss: fd.get('memory_loss') === 'on',
    pickup: str(fd.get('pickup'), 300) || null,
    dropoff: str(fd.get('dropoff'), 300) || null,
    ride_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    ride_time: /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : null,
    trip_type: str(fd.get('trip_type'), 20) || null,
    contact_name: str(fd.get('contact_name'), 120) || null,
    relationship: str(fd.get('relationship'), 80) || null,
    email: str(fd.get('email'), 160) || null,
    payment: str(fd.get('payment'), 80) || null,
    notes: str(fd.get('notes'), 2000) || null,
    quoted_price: num(fd.get('quoted_price')),
    internal_notes: str(fd.get('internal_notes'), 4000) || null,
    referral_source_id: /^[0-9a-f-]{36}$/i.test(str(fd.get('referral_source_id'), 60)) ? str(fd.get('referral_source_id'), 60) : null,
    decline_reason: str(fd.get('status'), 20) === 'declined' ? (ok(DECLINE_REASONS, str(fd.get('decline_reason'), 30), 'other')) : null,
  };
}

const UUID = /^[0-9a-f-]{36}$/i;

/* Attach the chosen driver and vehicle (or clear them) and keep the status honest:
   picking a driver moves New/Confirmed to Assigned; removing the driver
   from an Assigned ride moves it back to Confirmed. If no vehicle is picked,
   the driver's assigned vehicle is used. */
async function withDriver(fd: FormData, row: ReturnType<typeof bookingFields>) {
  const chosenDriver = str(fd.get('driver_id'), 60);
  const chosenVehicle = str(fd.get('vehicle_id'), 60);
  let driver: { id: string; name: string } | null = null;
  if (chosenDriver && UUID.test(chosenDriver)) {
    const { data } = await db().from('drivers').select('id, name').eq('id', chosenDriver).maybeSingle();
    if (data) driver = { id: data.id as string, name: data.name as string };
  }
  let vehicle: { id: string; name: string } | null = null;
  if (chosenVehicle && UUID.test(chosenVehicle)) {
    const { data } = await db().from('vehicles').select('id, name').eq('id', chosenVehicle).maybeSingle();
    if (data) vehicle = { id: data.id as string, name: data.name as string };
  } else if (driver) {
    const { data } = await db().from('vehicles').select('id, name').eq('driver_id', driver.id).neq('status', 'retired').limit(1).maybeSingle();
    if (data) vehicle = { id: data.id as string, name: data.name as string };
  }
  const status = driver
    ? (row.status === 'new' || row.status === 'confirmed' ? 'assigned' : row.status)
    : (row.status === 'assigned' ? 'confirmed' : row.status);
  return {
    ...row, status,
    driver_id: driver?.id ?? null, driver: driver?.name ?? null,
    vehicle_id: vehicle?.id ?? null, vehicle: vehicle?.name ?? null,
  };
}

/* Soft checks after saving. They never block dispatch, they just speak up. */
async function driverWarnings(bookingId: string, row: Awaited<ReturnType<typeof withDriver>>) {
  if (!OPEN_STATUSES.includes(row.status)) return [];
  const warns: string[] = [];
  const needsChair = Boolean(row.mobility && NEEDS_WHEELCHAIR.includes(row.mobility));
  if (row.vehicle_id) {
    const { data: v } = await db().from('vehicles').select('status, wheelchair_positions').eq('id', row.vehicle_id).maybeSingle();
    if (v && v.status !== 'active') warns.push('vehicle_down');
    if (v && needsChair && !(v.wheelchair_positions > 0)) warns.push('vehicle_chair');
  }
  if (!row.driver_id) return warns;
  const { data: d } = await db().from('drivers').select('wheelchair_trained, status').eq('id', row.driver_id).maybeSingle();
  if (d && !d.wheelchair_trained && needsChair) warns.push('wheelchair');
  if (d && d.status !== 'active') warns.push('inactive');
  if (row.ride_date) {
    const { data: same } = await db().from('bookings').select('id, ride_time')
      .eq('driver_id', row.driver_id).eq('ride_date', row.ride_date).in('status', OPEN_STATUSES).neq('id', bookingId);
    const mins = (t?: string | null) => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : null);
    const mine = mins(row.ride_time);
    const clash = (same || []).some(o => {
      const theirs = mins(o.ride_time as string | null);
      return mine === null || theirs === null || Math.abs(mine - theirs) < 90;
    });
    if (clash) warns.push('overlap');
  }
  return warns;
}
const warnQuery = (w: string[]) => (w.length ? '&warn=' + w.join(',') : '');

/* Ride activity moves a referral source along the SOP pipeline, and the first
   completed ride from a source schedules the after-ride check-in (SOP section 9). */
async function referralActivity(sourceId: string | null, status: string, adminEmail: string) {
  if (!sourceId) return;
  const [{ data: src }, { count: total }, { count: done }] = await Promise.all([
    db().from('referral_sources').select('status').eq('id', sourceId).maybeSingle(),
    db().from('bookings').select('id', { count: 'exact', head: true }).eq('referral_source_id', sourceId),
    db().from('bookings').select('id', { count: 'exact', head: true }).eq('referral_source_id', sourceId).eq('status', 'completed'),
  ]);
  if (!src) return;
  const patch: Record<string, unknown> = {};
  if ((total ?? 0) >= 2 && ['prospect', 'contacted', 'qualified', 'activated', 'active', 'dormant'].includes(src.status)) patch.status = 'repeat';
  else if ((total ?? 0) >= 1 && PRE_ACTIVATION.includes(src.status)) patch.status = 'activated';
  if (status === 'completed' && done === 1) {
    const { count: checked } = await db().from('referral_touches').select('id', { count: 'exact', head: true }).eq('source_id', sourceId).eq('kind', 'after_ride');
    if (!checked) {
      patch.next_follow_up = addDays(todayET(), 2);
      await db().from('referral_touches').insert({ source_id: sourceId, kind: 'note', created_by: adminEmail,
        outcome: 'First completed ride from this source. Check in within 1-2 business days to confirm it went smoothly and thank them.' });
    }
  }
  if (Object.keys(patch).length) await db().from('referral_sources').update(patch).eq('id', sourceId);
}

export async function createBooking(fd: FormData) {
  const admin = await requireAdmin();
  const base = bookingFields(fd);
  if (!base.rider_name || !base.rider_phone) redirect('/admin/bookings/new?error=required');
  const row = await withDriver(fd, base);
  const { data, error } = await db().from('bookings').insert({ ...row, source: 'phone', seen_at: new Date().toISOString() }).select('id').single();
  if (error || !data) redirect('/admin/bookings/new?error=save');
  const warns = await driverWarnings(data.id, row);
  await referralActivity(row.referral_source_id, row.status, admin.email);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/bookings/${data.id}?saved=1${warnQuery(warns)}`);
}

export async function updateBooking(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd.get('id'), 60);
  const base = bookingFields(fd);
  if (!id) redirect('/admin/bookings');
  if (!base.rider_name || !base.rider_phone) redirect(`/admin/bookings/${id}?error=required`);
  const row = await withDriver(fd, base);
  const { error } = await db().from('bookings').update(row).eq('id', id);
  if (error) redirect(`/admin/bookings/${id}?error=save`);
  const warns = await driverWarnings(id, row);
  await referralActivity(row.referral_source_id, row.status, admin.email);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/bookings/${id}?saved=1${warnQuery(warns)}`);
}

export async function deleteBooking(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (fd.get('confirm') !== 'yes') redirect(`/admin/bookings/${id}?error=confirm`);
  await db().from('bookings').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect('/admin/bookings');
}

/* ---------- applications ---------- */
export async function updateApplication(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  const { error } = await db().from('applications').update({
    status: ok(APPLICATION_STATUSES, str(fd.get('status'), 20), 'new'),
    internal_notes: str(fd.get('internal_notes'), 4000) || null,
  }).eq('id', id);
  if (error) redirect(`/admin/applications/${id}?error=save`);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/applications/${id}?saved=1`);
}

export async function deleteApplication(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (fd.get('confirm') !== 'yes') redirect(`/admin/applications/${id}?error=confirm`);
  await db().from('applications').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect('/admin/applications');
}

/* One click from a hired applicant to a driver on the roster. */
export async function hireApplicant(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (!UUID.test(id)) redirect('/admin/applications');
  const { data: existing } = await db().from('drivers').select('id').eq('application_id', id).maybeSingle();
  if (existing) redirect(`/admin/drivers/${existing.id}`);
  const { data: a } = await db().from('applications').select('*').eq('id', id).maybeSingle();
  if (!a) redirect('/admin/applications');
  const wc = String(a.wheelchair_exp || '').toLowerCase();
  const { data, error } = await db().from('drivers').insert({
    name: a.name, phone: a.phone, email: a.email, status: 'active', application_id: a.id,
    // Only "Experienced" or "Certified" count. "Some experience" still needs training sign-off.
    wheelchair_trained: /^(experienced|certified)/.test(wc),
    notes: [a.license && `License: ${a.license}`, a.availability && `Availability: ${a.availability}`].filter(Boolean).join('\n') || null,
  }).select('id').single();
  if (error || !data) redirect(`/admin/applications/${id}?error=save`);
  await db().from('applications').update({ status: 'hired' }).eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/drivers/${data.id}?saved=hired`);
}

/* ---------- drivers ---------- */
function driverFields(fd: FormData) {
  const exp = str(fd.get('license_expires'), 10);
  return {
    name: str(fd.get('name'), 120),
    phone: str(fd.get('phone'), 40),
    email: str(fd.get('email'), 160) || null,
    status: ok(DRIVER_STATUSES, str(fd.get('status'), 20), 'active'),
    wheelchair_trained: fd.get('wheelchair_trained') === 'on',
    license_expires: /^\d{4}-\d{2}-\d{2}$/.test(exp) ? exp : null,
    notes: str(fd.get('notes'), 4000) || null,
  };
}

export async function createDriver(fd: FormData) {
  await requireAdmin();
  const row = driverFields(fd);
  if (!row.name || !row.phone) redirect('/admin/drivers/new?error=required');
  const { data, error } = await db().from('drivers').insert(row).select('id').single();
  if (error || !data) redirect('/admin/drivers/new?error=save');
  revalidatePath('/admin', 'layout');
  redirect(`/admin/drivers/${data.id}?saved=1`);
}

export async function updateDriver(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (!UUID.test(id)) redirect('/admin/drivers');
  const row = driverFields(fd);
  if (!row.name || !row.phone) redirect(`/admin/drivers/${id}?error=required`);
  const { error } = await db().from('drivers').update(row).eq('id', id);
  if (error) redirect(`/admin/drivers/${id}?error=save`);
  // Keep the name shown on their bookings in step with the roster.
  await db().from('bookings').update({ driver: row.name }).eq('driver_id', id);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/drivers/${id}?saved=1`);
}

export async function deleteDriver(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (fd.get('confirm') !== 'yes') redirect(`/admin/drivers/${id}?error=confirm`);
  // Open rides go back to the unassigned pile instead of silently keeping a ghost driver.
  await db().from('bookings').update({ status: 'confirmed', driver_id: null, driver: null })
    .eq('driver_id', id).eq('status', 'assigned');
  await db().from('drivers').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect('/admin/drivers');
}

/* ---------- vehicles ---------- */
const int = (v: FormDataEntryValue | null) => { const n = num(v); return n === null ? null : Math.round(n); };
const day = (v: FormDataEntryValue | null) => { const d = str(v, 10); return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; };

function vehicleFields(fd: FormData) {
  const driver = str(fd.get('driver_id'), 60);
  return {
    name: str(fd.get('name'), 60),
    type: ok(VEHICLE_TYPES, str(fd.get('type'), 30), 'wheelchair_van'),
    make: str(fd.get('make'), 60) || null,
    model: str(fd.get('model'), 60) || null,
    year: int(fd.get('year')),
    plate: str(fd.get('plate'), 20).toUpperCase() || null,
    vin: str(fd.get('vin'), 20).toUpperCase() || null,
    color: str(fd.get('color'), 30) || null,
    seats: int(fd.get('seats')),
    wheelchair_positions: Math.max(0, int(fd.get('wheelchair_positions')) ?? 0),
    status: ok(VEHICLE_STATUSES, str(fd.get('status'), 20), 'active'),
    mileage: Math.max(0, int(fd.get('mileage')) ?? 0),
    driver_id: UUID.test(driver) ? driver : null,
    oil_interval: Math.max(0, int(fd.get('oil_interval')) ?? 5000),
    inspection_expires: day(fd.get('inspection_expires')),
    registration_expires: day(fd.get('registration_expires')),
    insurance_expires: day(fd.get('insurance_expires')),
    lift_service_due: day(fd.get('lift_service_due')),
    notes: str(fd.get('notes'), 4000) || null,
  };
}

/* One primary vehicle per driver: assigning a driver here frees them from any other vehicle. */
async function claimDriver(vehicleId: string, driverId: string | null) {
  if (driverId) await db().from('vehicles').update({ driver_id: null }).eq('driver_id', driverId).neq('id', vehicleId);
}

export async function createVehicle(fd: FormData) {
  await requireAdmin();
  const row = vehicleFields(fd);
  if (!row.name) redirect('/admin/vehicles/new?error=required');
  const { data, error } = await db().from('vehicles').insert(row).select('id').single();
  if (error || !data) redirect('/admin/vehicles/new?error=save');
  await claimDriver(data.id, row.driver_id);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/vehicles/${data.id}?saved=1`);
}

export async function updateVehicle(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (!UUID.test(id)) redirect('/admin/vehicles');
  const row = vehicleFields(fd);
  if (!row.name) redirect(`/admin/vehicles/${id}?error=required`);
  const { error } = await db().from('vehicles').update(row).eq('id', id);
  if (error) redirect(`/admin/vehicles/${id}?error=save`);
  await claimDriver(id, row.driver_id);
  await db().from('bookings').update({ vehicle: row.name }).eq('vehicle_id', id);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/vehicles/${id}?saved=1`);
}

export async function deleteVehicle(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (fd.get('confirm') !== 'yes') redirect(`/admin/vehicles/${id}?error=confirm`);
  await db().from('vehicles').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect('/admin/vehicles');
}

export async function addVehicleLog(fd: FormData) {
  const admin = await requireAdmin();
  const vehicleId = str(fd.get('vehicle_id'), 60);
  if (!UUID.test(vehicleId)) redirect('/admin/vehicles');
  const kind = ok(LOG_KINDS, str(fd.get('kind'), 20), 'maintenance');
  const mileage = int(fd.get('mileage'));
  const row = {
    vehicle_id: vehicleId, kind,
    log_date: day(fd.get('log_date')) || new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }),
    mileage: mileage != null && mileage >= 0 ? mileage : null,
    cost: num(fd.get('cost')),
    vendor: str(fd.get('vendor'), 120) || null,
    description: str(fd.get('description'), 2000) || null,
    next_due_date: day(fd.get('next_due_date')),
    next_due_mileage: int(fd.get('next_due_mileage')),
    created_by: admin.email,
  };
  if (kind === 'mileage' && row.mileage == null) redirect(`/admin/vehicles/${vehicleId}?error=mileage#log`);
  const { error } = await db().from('vehicle_logs').insert(row);
  if (error) redirect(`/admin/vehicles/${vehicleId}?error=save#log`);

  // Let the log keep the vehicle record current.
  const { data: v } = await db().from('vehicles').select('mileage').eq('id', vehicleId).maybeSingle();
  const patch: Record<string, unknown> = {};
  if (v && row.mileage != null && row.mileage > (v.mileage ?? 0)) patch.mileage = row.mileage;
  if (row.next_due_date && kind === 'inspection') patch.inspection_expires = row.next_due_date;
  if (row.next_due_date && kind === 'lift') patch.lift_service_due = row.next_due_date;
  if (Object.keys(patch).length) await db().from('vehicles').update(patch).eq('id', vehicleId);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/vehicles/${vehicleId}?saved=log#log`);
}

export async function deleteVehicleLog(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60), vehicleId = str(fd.get('vehicle_id'), 60);
  if (UUID.test(id)) await db().from('vehicle_logs').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/vehicles/${vehicleId}?saved=removed#log`);
}

/* ---------- rates ---------- */
export async function saveRates(fd: FormData) {
  await requireAdmin();
  const level = (k: 'ambulatory' | 'wheelchair') => {
    const base = num(fd.get(`${k}_base`)), inc = num(fd.get(`${k}_included`)), per = num(fd.get(`${k}_permile`));
    if (base === null || inc === null || per === null || base < 0 || inc < 0 || per < 0 || base > 5000 || per > 100) return null;
    return { base, includedMiles: inc, perMile: per };
  };
  const ambulatory = level('ambulatory'), wheelchair = level('wheelchair');
  if (!ambulatory || !wheelchair) redirect('/admin/rates?error=invalid');
  const value = { ambulatory, wheelchair, note: str(fd.get('note'), 400) };
  const { error } = await db().from('settings').upsert({ key: 'rates', value, updated_at: new Date().toISOString() });
  if (error) redirect('/admin/rates?error=save');
  refreshSite();
  redirect('/admin/rates?saved=1');
}

export async function resetRates() {
  await requireAdmin();
  await db().from('settings').upsert({ key: 'rates', value: DEFAULT_RATES, updated_at: new Date().toISOString() });
  refreshSite();
  redirect('/admin/rates?saved=1');
}

/* ---------- company settings ---------- */
const list = (v: FormDataEntryValue | null) =>
  String(v ?? '').split(/[\n,]/).map(s => s.trim()).filter(Boolean).slice(0, 200);

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const value = {
    phone: str(fd.get('phone'), 40) || DEFAULT_COMPANY.phone,
    email: str(fd.get('email'), 160) || DEFAULT_COMPANY.email,
    street: str(fd.get('street'), 160) || DEFAULT_COMPANY.street,
    city: str(fd.get('city'), 80) || DEFAULT_COMPANY.city,
    state: str(fd.get('state'), 2).toUpperCase() || DEFAULT_COMPANY.state,
    zip: str(fd.get('zip'), 10) || DEFAULT_COMPANY.zip,
    hours: str(fd.get('hours'), 160),
    announcement: str(fd.get('announcement'), 160),
    responseTime: str(fd.get('responseTime'), 120) || DEFAULT_COMPANY.responseTime,
    coreTowns: list(fd.get('coreTowns')),
    extendedTowns: list(fd.get('extendedTowns')),
  };
  const { error } = await db().from('settings').upsert({ key: 'company', value, updated_at: new Date().toISOString() });
  if (error) redirect('/admin/settings?error=save');
  refreshSite();
  redirect('/admin/settings?saved=1');
}

/* ---------- referral network ---------- */
function sourceFields(fd: FormData) {
  const type = ok(ORG_TYPES, str(fd.get('org_type'), 30), 'other');
  const tier = Number(fd.get('tier'));
  return {
    organization: str(fd.get('organization'), 160),
    org_type: type,
    tier: tier === 1 || tier === 2 ? tier : (ORG_TYPES.find(t => t.id === type)?.tier ?? 2),
    area: str(fd.get('area'), 200) || null,
    contact_name: str(fd.get('contact_name'), 120) || null,
    contact_role: str(fd.get('contact_role'), 120) || null,
    phone: str(fd.get('phone'), 40) || null,
    email: str(fd.get('email'), 160) || null,
    preferred_contact: str(fd.get('preferred_contact'), 200) || null,
    status: ok(SOURCE_STATUSES, str(fd.get('status'), 20), 'prospect'),
    info_sent: fd.get('info_sent') === 'on',
    next_follow_up: day(fd.get('next_follow_up')),
    notes: str(fd.get('notes'), 4000) || null,
  };
}

export async function createSource(fd: FormData) {
  await requireAdmin();
  const row = sourceFields(fd);
  if (!row.organization) redirect('/admin/referrals/new?error=required');
  const { data, error } = await db().from('referral_sources').insert({ ...row, next_follow_up: row.next_follow_up || todayET() }).select('id').single();
  if (error || !data) redirect('/admin/referrals/new?error=save');
  revalidatePath('/admin', 'layout');
  redirect(`/admin/referrals/${data.id}?saved=1`);
}

export async function updateSource(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (!UUID.test(id)) redirect('/admin/referrals');
  const row = sourceFields(fd);
  if (!row.organization) redirect(`/admin/referrals/${id}?error=required`);
  const { error } = await db().from('referral_sources').update(row.status === 'closed' ? { ...row, next_follow_up: null } : row).eq('id', id);
  if (error) redirect(`/admin/referrals/${id}?error=save`);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/referrals/${id}?saved=1`);
}

export async function deleteSource(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (fd.get('confirm') !== 'yes') redirect(`/admin/referrals/${id}?error=confirm`);
  await db().from('referral_sources').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect('/admin/referrals');
}

export async function logTouch(fd: FormData) {
  const admin = await requireAdmin();
  const sourceId = str(fd.get('source_id'), 60);
  if (!UUID.test(sourceId)) redirect('/admin/referrals');
  const kind = ok(TOUCH_KINDS, str(fd.get('kind'), 20), 'call');
  const date = day(fd.get('touch_date')) || todayET();
  const { error } = await db().from('referral_touches').insert({
    source_id: sourceId, kind, touch_date: date, outcome: str(fd.get('outcome'), 2000) || null, created_by: admin.email,
  });
  if (error) redirect(`/admin/referrals/${sourceId}?error=save#touch`);

  const { data: src } = await db().from('referral_sources').select('status, first_contacted, last_contact').eq('id', sourceId).maybeSingle();
  const outward = kind !== 'note';
  const patch: Record<string, unknown> = {};
  if (outward) {
    patch.last_contact = !src?.last_contact || date > src.last_contact ? date : src.last_contact;
    if (!src?.first_contacted || date < src.first_contacted) patch.first_contacted = date;
    if (src?.status === 'prospect') patch.status = 'contacted';
  }
  if (kind === 'info_sent' || fd.get('info_sent') === 'on') patch.info_sent = true;
  const nextStatus = ok(SOURCE_STATUSES, str(fd.get('new_status'), 20), '');
  if (nextStatus) patch.status = nextStatus;
  const next = day(fd.get('next_follow_up'));
  if (next) patch.next_follow_up = next;
  else if (fd.get('clear_follow_up') === 'on') patch.next_follow_up = null;
  if (patch.status === 'closed') patch.next_follow_up = null;
  if (Object.keys(patch).length) await db().from('referral_sources').update(patch).eq('id', sourceId);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/referrals/${sourceId}?saved=touch#touch`);
}

export async function deleteTouch(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60), sourceId = str(fd.get('source_id'), 60);
  if (UUID.test(id)) await db().from('referral_touches').delete().eq('id', id);
  redirect(`/admin/referrals/${sourceId}?saved=removed#touch`);
}

/* ---------- feedback ---------- */
export async function publishFeedback(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  if (!UUID.test(id)) redirect('/admin/feedback');
  const { data: f } = await db().from('feedback').select('*').eq('id', id).maybeSingle();
  // Consent is checked on the server too, never just hidden in the UI.
  if (!f || !f.allow_publish) redirect('/admin/feedback');
  if (f.testimonial_id) redirect('/admin/testimonials');
  const { data: t, error } = await db().from('testimonials').insert({
    name: creditName(f.name, f.credit), role: creditRole(f.relationship), quote: f.message, published: true, feedback_id: f.id,
  }).select('id').single();
  if (error || !t) redirect('/admin/feedback?saved=0');
  await db().from('feedback').update({ status: 'published', testimonial_id: t.id }).eq('id', id);
  refreshSite();
  revalidatePath('/admin', 'layout');
  redirect('/admin/feedback?saved=published');
}

export async function setFeedbackStatus(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  const status = ok(FEEDBACK_STATUSES, str(fd.get('status'), 20), 'reviewed');
  if (UUID.test(id) && status !== 'published') await db().from('feedback').update({ status }).eq('id', id);
  revalidatePath('/admin', 'layout');
  redirect('/admin/feedback?saved=1');
}

/* ---------- testimonials ---------- */
export async function addTestimonial(fd: FormData) {
  await requireAdmin();
  const name = str(fd.get('name'), 120), quote = str(fd.get('quote'), 1000);
  if (!name || !quote) redirect('/admin/testimonials?error=required');
  await db().from('testimonials').insert({ name, role: str(fd.get('role'), 120), quote, published: fd.get('published') === 'on' });
  refreshSite();
  redirect('/admin/testimonials?saved=1');
}

export async function toggleTestimonial(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  await db().from('testimonials').update({ published: fd.get('published') === 'true' }).eq('id', id);
  refreshSite();
  redirect('/admin/testimonials?saved=1');
}

export async function deleteTestimonial(fd: FormData) {
  await requireAdmin();
  await db().from('testimonials').delete().eq('id', str(fd.get('id'), 60));
  refreshSite();
  redirect('/admin/testimonials?saved=1');
}
