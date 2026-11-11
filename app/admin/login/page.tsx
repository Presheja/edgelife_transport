import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/auth';
import { signIn } from '../actions';

export const metadata = { title: 'Sign in' };

const MESSAGES: Record<string, string> = {
  invalid: 'That email and password did not work.',
  slow: 'Too many attempts. Wait a few minutes and try again.',
  config: 'The database is not connected yet. Check the Supabase environment variables.',
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdmin()) redirect('/admin');
  const { error } = await searchParams;
  return (
    <div className="login">
      <div className="adm-card">
        <h1 style={{ fontSize: '1.7rem' }}>EdgeLIFE Admin</h1>
        <p className="sub">Sign in to manage bookings, rates and site information.</p>
        {error && <div className="flash bad">{MESSAGES[error] || 'Could not sign in.'}</div>}
        <form action={signIn} className="f-grid">
          <div className="fld full"><label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required /></div>
          <div className="fld full"><label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <div className="full"><button className="abtn pri" type="submit">Sign in</button></div>
        </form>
      </div>
    </div>
  );
}
