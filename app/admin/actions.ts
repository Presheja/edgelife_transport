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
    vehicle: str(fd.get('vehicle'), 60) || null,
    internal_notes: str(fd.get('internal_notes'), 4000) || null,
  };
}

const UUID = /^[0-9a-f-]{36}$/i;

/* Attach the chosen driver (or clear it) and keep the status honest:
   picking a driver moves New/Confirmed to Assigned; removing the driver
   from an Assigned ride moves it back to Confirmed. */
async function withDriver(fd: FormData, row: ReturnType<typeof bookingFields>) {
  const chosen = str(fd.get('driver_id'), 60);
  if (chosen && UUID.test(chosen)) {
    const { data } = await db().from('drivers').select('id, name, vehicle').eq('id', chosen).maybeSingle();
    if (data) {
      const status = row.status === 'new' || row.status === 'confirmed' ? 'assigned' : row.status;
      return { ...row, status, driver_id: data.id as string, driver: data.name as string, vehicle: row.vehicle || (data.vehicle as string | null) };
    }
  }
  return { ...row, status: row.status === 'assigned' ? 'confirmed' : row.status, driver_id: null, driver: null };
}

/* Soft checks after saving. They never block dispatch, they just speak up. */
async function driverWarnings(bookingId: string, row: Awaited<ReturnType<typeof withDriver>>) {
  if (!row.driver_id || !OPEN_STATUSES.includes(row.status)) return [];
  const warns: string[] = [];
  const { data: d } = await db().from('drivers').select('wheelchair_trained, status').eq('id', row.driver_id).maybeSingle();
  if (d && !d.wheelchair_trained && row.mobility && NEEDS_WHEELCHAIR.includes(row.mobility)) warns.push('wheelchair');
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

export async function createBooking(fd: FormData) {
  await requireAdmin();
  const base = bookingFields(fd);
  if (!base.rider_name || !base.rider_phone) redirect('/admin/bookings/new?error=required');
  const row = await withDriver(fd, base);
  const { data, error } = await db().from('bookings').insert({ ...row, source: 'phone' }).select('id').single();
  if (error || !data) redirect('/admin/bookings/new?error=save');
  const warns = await driverWarnings(data.id, row);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/bookings/${data.id}?saved=1${warnQuery(warns)}`);
}

export async function updateBooking(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  const base = bookingFields(fd);
  if (!id) redirect('/admin/bookings');
  if (!base.rider_name || !base.rider_phone) redirect(`/admin/bookings/${id}?error=required`);
  const row = await withDriver(fd, base);
  const { error } = await db().from('bookings').update(row).eq('id', id);
  if (error) redirect(`/admin/bookings/${id}?error=save`);
  const warns = await driverWarnings(id, row);
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
    vehicle: str(fd.get('vehicle'), 60) || null,
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
