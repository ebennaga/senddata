import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const isValid = token === process.env.SESSION_SECRET;

  // External cron endpoint — auth via CRON_SECRET header, not cookie
  if (pathname === '/api/send-pertamina') return NextResponse.next();

  if (pathname === '/login') {
    if (isValid) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!isValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
