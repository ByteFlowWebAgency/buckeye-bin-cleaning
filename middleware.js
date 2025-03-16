import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only protect admin routes that aren't the login page
  if (
    request.nextUrl.pathname.startsWith('/admin') && 
    !request.nextUrl.pathname.includes('/admin/login')
  ) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Always allow the login page to render
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};