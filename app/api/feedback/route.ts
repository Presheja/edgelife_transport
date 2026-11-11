import { NextResponse } from 'next/server';
import { serviceDb } from '@/lib/supabase/admin';
import { notify } from '@/lib/mail';
import { clientIp, tooMany } from '@/lib/ratelimit';
import { str, validEmail } from '@/lib/validate';
import { CREDITS, RELATIONSHIPS } from '@/lib/feedback';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (tooMany('feedback:' + clientIp(req), 4)) {
      return NextResponse.json({ ok: false, error: 'Too many messages from this connection. Please try again later.' }, { status: 429 });
    }
    const d = await req.json();
    if (str(d?.website)) return NextResponse.json({ ok: true }); // honeypot

    const name = str(d?.name, 120);
    const email = str(d?.email, 160);
    const message = str(d?.message, 1500);
    if (!name || message.length < 10) {
      return NextResponse.json({ ok: false, error: 'Please add your name and a few words about your experience.' }, { status: 400 });
    }
    if (!validEmail(email)) {
      return NextResponse.json({ ok: false, error: 'That email address does not look right.' }, { status: 400 });
    }
    const rating = Number(d?.rating);
    const relationship = RELATIONSHIPS.some(r => r.id === d?.relationship) ? String(d.relationship) : 'other';
    const credit = CREDITS.some(c => c.id === d?.credit) ? String(d.credit) : 'first_initial';
    const row = {
      name, email: email || null, relationship, message, credit,
      rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
      allow_publish: d?.doNotPublish !== true,
      status: 'new',
    };

    const db = serviceDb();
    if (!db) return NextResponse.json({ ok: false, error: 'Feedback is temporarily unavailable. Please call us.' }, { status: 503 });
    const { error } = await db.from('feedback').insert(row);
    if (error) {
      console.error('[EdgeLIFE] feedback database error', { code: error.code, message: error.message });
      return NextResponse.json({ ok: false, error: 'We could not save your feedback. Please try again in a moment.' }, { status: 503 });
    }

    await notify(`New feedback${row.rating ? ` (${row.rating}/5)` : ''} from ${name}`, [
      ['Name', name], ['Email', email], ['Relationship', relationship], ['Rating', row.rating ? `${row.rating}/5` : 'Not given'],
      ['May publish', row.allow_publish ? 'Yes' : 'No, asked not to'], ['Message', message],
    ], email || undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[EdgeLIFE] feedback failed', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
