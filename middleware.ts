import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isOfficeRoute = request.nextUrl.pathname.startsWith('/office');
  const hasSession = Boolean(request.cookies.get('mfo_session')?.value);

  if (isOfficeRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/office/:path*'],
};
