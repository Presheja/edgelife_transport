import { requireAdmin } from '@/lib/auth';
import { serviceDb } from '@/lib/supabase/admin';
import { addTestimonial, toggleTestimonial, deleteTestimonial } from '../actions';

export const metadata = { title: 'Testimonials' };
export const dynamic = 'force-dynamic';

interface T { id: string; name: string; role: string; quote: string; published: boolean }

export default async function Testimonials({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { saved, error } = await searchParams;
  const { data } = await serviceDb()!.from('testimonials').select('*').order('created_at', { ascending: false });
  const rows = (data || []) as T[];
  return (
    <>
      <h1>Testimonials</h1>
      <p className="sub">Only real reviews from real customers, used with their permission. The homepage section appears once at least one is published.</p>
      {saved && <div className="flash good">Saved.</div>}
      {error && <div className="flash bad">A name and a quote are required.</div>}
      <form action={addTestimonial} className="adm-card">
        <h2>Add a testimonial</h2>
        <div className="f-grid">
          <div className="fld"><label htmlFor="name">Name</label><input id="name" name="name" placeholder="Maria S." required /></div>
          <div className="fld"><label htmlFor="role">Who they are</label><input id="role" name="role" placeholder="Daughter of a regular rider · Taunton" /></div>
          <div className="fld full"><label htmlFor="quote">What they said</label><textarea id="quote" name="quote" required /></div>
          <div className="fld full"><label className="chk-row"><input type="checkbox" name="published" /> Publish on the homepage now</label></div>
        </div>
        <div className="row-btn"><button className="abtn pri" type="submit">Add</button></div>
      </form>
      <div className="tbl-wrap">
        {rows.length === 0 ? <div className="empty">None yet.</div> : (
          <table className="tbl"><thead><tr><th>Quote</th><th>Status</th><th></th></tr></thead><tbody>
            {rows.map(t => (
              <tr key={t.id}>
                <td style={{ maxWidth: 520 }}>&ldquo;{t.quote}&rdquo;<small>{t.name}{t.role ? `, ${t.role}` : ''}</small></td>
                <td><span className={`pill ${t.published ? 'completed' : ''}`}>{t.published ? 'Published' : 'Hidden'}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <form action={toggleTestimonial} style={{ display: 'inline' }}>
                    <input type="hidden" name="id" value={t.id} /><input type="hidden" name="published" value={String(!t.published)} />
                    <button className="abtn out" type="submit">{t.published ? 'Hide' : 'Publish'}</button></form>{' '}
                  <form action={deleteTestimonial} style={{ display: 'inline' }}>
                    <input type="hidden" name="id" value={t.id} /><button className="abtn danger" type="submit">Delete</button></form>
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
    </>
  );
}
