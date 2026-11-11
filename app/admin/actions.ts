'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { authClient } from '@/lib/supabase/server';
import { allowedEmails, requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { tooMany } from '@/lib/ratelimit';
import { str } from '@/lib/validate';
import { BOOKING_STATUSES, APPLICATION_STATUSES } from '@/lib/admin-constants';
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
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect('/admin/login?error=config');
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
    driver: str(fd.get('driver'), 120) || null,
    vehicle: str(fd.get('vehicle'), 60) || null,
    internal_notes: str(fd.get('internal_notes'), 4000) || null,
  };
}

export async function createBooking(fd: FormData) {
  await requireAdmin();
  const row = bookingFields(fd);
  if (!row.rider_name || !row.rider_phone) redirect('/admin/bookings/new?error=required');
  const { data, error } = await db().from('bookings').insert({ ...row, source: 'phone' }).select('id').single();
  if (error || !data) redirect('/admin/bookings/new?error=save');
  revalidatePath('/admin', 'layout');
  redirect(`/admin/bookings/${data.id}?saved=1`);
}

export async function updateBooking(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'), 60);
  const row = bookingFields(fd);
  if (!id) redirect('/admin/bookings');
  if (!row.rider_name || !row.rider_phone) redirect(`/admin/bookings/${id}?error=required`);
  const { error } = await db().from('bookings').update(row).eq('id', id);
  if (error) redirect(`/admin/bookings/${id}?error=save`);
  revalidatePath('/admin', 'layout');
  redirect(`/admin/bookings/${id}?saved=1`);
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
