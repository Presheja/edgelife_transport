import { requireAdmin, allowedEmails } from '@/lib/auth';
import { changePassword, signOut } from '../actions';

export const metadata = { title: 'Profile' };

const MESSAGES: Record<string, string> = {
  short: 'Use at least 10 characters.',
  match: 'The two passwords do not match.',
  save: 'Could not change the password. Sign out, sign back in, and try again.',
};

export default async function Profile({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const admin = await requireAdmin();
  const { saved, error } = await searchParams;
  const team = allowedEmails();
  return (
    <>
      <h1>Profile</h1>
      <p className="sub">Signed in as <b>{admin.email}</b></p>
      {saved && <div className="flash good">Password changed.</div>}
      {error && <div className="flash bad">{MESSAGES[error] || 'Something went wrong.'}</div>}
      <div className="two-col">
        <form action={changePassword} className="adm-card">
          <h2>Change password</h2>
          <div className="f-grid">
            <div className="fld full"><label htmlFor="password">New password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required /></div>
            <div className="fld full"><label htmlFor="confirm">Type it again</label>
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required /></div>
          </div>
          <div className="row-btn"><button className="abtn pri" type="submit">Change password</button></div>
        </form>
        <div className="adm-card">
          <h2>Who has admin access</h2>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18 }}>{team.map(e => <li key={e}>{e}</li>)}</ul>
          <p className="sub" style={{ marginBottom: 0 }}>
            To add someone: create them a user in Supabase (Authentication &rarr; Users), then add their email to
            <code> ADMIN_EMAILS</code> in Hostinger and redeploy. Both are needed, on purpose.
          </p>
          <form action={signOut} className="row-btn"><button className="abtn out" type="submit">Sign out</button></form>
        </div>
      </div>
    </>
  );
}
