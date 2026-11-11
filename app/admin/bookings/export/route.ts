import { currentAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const cols = ['created_at', 'source', 'status', 'rider_name', 'rider_phone', 'mobility', 'memory_loss', 'pickup', 'dropoff',
  'ride_date', 'ride_time', 'trip_type', 'contact_name', 'relationship', 'email', 'payment', 'quoted_price', 'driver', 'vehicle', 'notes', 'internal_notes'];

/* Spreadsheet programs run formulas that start with = + - @, so neutralize them. */
const cell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};

export async function GET() {
  if (!(await currentAdmin())) return new Response('Unauthorized', { status: 401 });
  const { data } = await serviceDb()!.from('bookings').select('*').order('created_at', { ascending: false }).limit(10000);
  const lines = [cols.join(',')].concat((data || []).map(r => cols.map(c => cell((r as Record<string, unknown>)[c])).join(',')));
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="edgelife-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
