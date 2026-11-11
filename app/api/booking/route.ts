import { NextResponse } from 'next/server';
import { serviceDb } from '@/lib/supabase/admin';
import { notify } from '@/lib/mail';
import { clientIp, tooMany } from '@/lib/ratelimit';
import { str, validEmail, validPhone } from '@/lib/validate';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (tooMany('booking:' + clientIp(req))) {
      return NextResponse.json({ ok: false, error: 'Too many requests. Please call us.' }, { status: 429 });
    }
    const d = await req.json();
    // Honeypot: real people never fill this. Pretend success so bots move on.
    if (str(d?.website)) return NextResponse.json({ ok: true });

    const riderName = str(d?.riderName, 120);
    const riderPhone = str(d?.riderPhone, 40);
    const email = str(d?.email, 160);
    if (!riderName || !validPhone(riderPhone)) {
      return NextResponse.json({ ok: false, error: 'A name and a valid phone number are required.' }, { status: 400 });
    }
    if (!validEmail(email)) {
      return NextResponse.json({ ok: false, error: 'That email address does not look right.' }, { status: 400 });
    }
    if (!str(d?.pickup) || !str(d?.dropoff) || !/^\d{4}-\d{2}-\d{2}$/.test(str(d?.date, 10)) || !/^\d{2}:\d{2}$/.test(str(d?.time, 5))) {
      return NextResponse.json({ ok: false, error: 'Please provide pickup and destination addresses, a ride date, and appointment time.' }, { status: 400 });
    }

    const row = {
      source: 'website',
      status: 'new',
      rider_name: riderName,
      rider_phone: riderPhone,
      mobility: str(d?.mobility, 40),
      memory_loss: Boolean(d?.dementia),
      pickup: str(d?.pickup, 300),
      dropoff: str(d?.dropoff, 300),
      ride_date: /^\d{4}-\d{2}-\d{2}$/.test(str(d?.date, 10)) ? str(d.date, 10) : null,
      ride_time: /^\d{2}:\d{2}$/.test(str(d?.time, 5)) ? str(d.time, 5) : null,
      trip_type: str(d?.tripType, 20),
      contact_name: str(d?.contactName, 120),
      relationship: str(d?.relationship, 80),
      email,
      payment: str(d?.payment, 80),
      notes: str(d?.notes, 2000),
    };

    const db = serviceDb();
    if (db) {
      const { error } = await db.from('bookings').insert(row);
      if (error) {
        console.error('[EdgeLIFE] booking database error', { code: error.code, message: error.message, hint: error.hint, details: error.details });
        return NextResponse.json({ ok: false, error: 'We could not save your request. Please call dispatch to arrange your ride.' }, { status: 503 });
      }
    } else if (process.env.NODE_ENV !== 'production') {
      // Local development without Supabase: keep the submission in a file.
      const file = path.join(process.cwd(), 'data', 'submissions.ndjson');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.appendFile(file, JSON.stringify({ type: 'booking', at: new Date().toISOString(), ...row }) + '\n');
    } else {
      console.error('[EdgeLIFE] booking unavailable: configure the Supabase project URL and server secret key');
      return NextResponse.json({ ok: false, error: 'Online booking is temporarily unavailable. Please call dispatch to arrange your ride.' }, { status: 503 });
    }

    await notify('New ride request: ' + riderName, [
      ['Rider', riderName], ['Phone', riderPhone], ['Mobility', row.mobility],
      ['Pickup', row.pickup], ['Destination', row.dropoff],
      ['Date', row.ride_date || ''], ['Time', row.ride_time || ''], ['Trip type', row.trip_type],
      ['Contact', row.contact_name], ['Email', email], ['Payment', row.payment], ['Notes', row.notes],
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[EdgeLIFE] booking failed', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
