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
    if (tooMany('careers:' + clientIp(req))) {
      return NextResponse.json({ ok: false, error: 'Too many requests. Please call us.' }, { status: 429 });
    }
    const d = await req.json();
    if (str(d?.website)) return NextResponse.json({ ok: true });

    const name = str(d?.name, 120);
    const phone = str(d?.phone, 40);
    const email = str(d?.email, 160);
    if (!name || !validPhone(phone)) {
      return NextResponse.json({ ok: false, error: 'A name and a valid phone number are required.' }, { status: 400 });
    }
    if (!validEmail(email)) {
      return NextResponse.json({ ok: false, error: 'That email address does not look right.' }, { status: 400 });
    }

    const row = {
      status: 'new',
      name, phone, email,
      town: str(d?.town, 120),
      license: str(d?.license, 60),
      years: str(d?.years, 40),
      wheelchair_exp: str(d?.wheelchairExp, 80),
      availability: str(d?.availability, 60),
      consent_screening: Boolean(d?.cdl),
      notes: str(d?.notes, 2000),
    };

    const db = serviceDb();
    if (db) {
      const { error } = await db.from('applications').insert(row);
      if (error) {
        console.error('[EdgeLIFE] application database error', { code: error.code, message: error.message, hint: error.hint, details: error.details });
        return NextResponse.json({ ok: false, error: 'We could not save your application. Please call us and we will take it by phone.' }, { status: 503 });
      }
    } else if (process.env.NODE_ENV !== 'production') {
      const file = path.join(process.cwd(), 'data', 'submissions.ndjson');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.appendFile(file, JSON.stringify({ type: 'application', at: new Date().toISOString(), ...row }) + '\n');
    } else {
      throw new Error('Supabase is not configured');
    }

    await notify('New driver application: ' + name, [
      ['Name', name], ['Phone', phone], ['Email', email], ['Town', row.town], ['License', row.license],
      ['Experience', row.years], ['Wheelchair', row.wheelchair_exp], ['Availability', row.availability], ['Notes', row.notes],
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[EdgeLIFE] application failed', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
