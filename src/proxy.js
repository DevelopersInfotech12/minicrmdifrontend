import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Handle token passed via URL query param (from Google OAuth)
  const urlToken = searchParams.get('token');
  if (urlToken) {
    const redirectTo = pathname === '/auth/callback' ? '/dashboard' : pathname;
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('token', urlToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  }

  const token = request.cookies.get('token')?.value;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  if (pathname === '/') {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};