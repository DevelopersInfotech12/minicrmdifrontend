import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function proxy(request) {
  // AUTH DISABLED
  return NextResponse.next(); // ← replace all logic with this one line
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
