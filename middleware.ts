import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/* Gate for /admin. This is only the first lock: every admin page and action
   ALSO re-checks the session and the ADMIN_EMAILS allowlist on the server
   (see lib/auth.ts), so a bypass here would still not expose any data. */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const isLogin = path === '/admin/login';
  if (!user && !isLogin) {
    const to = request.nextUrl.clone();
    to.pathname = '/admin/login';
    to.search = '';
    return NextResponse.redirect(to);
  }
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
