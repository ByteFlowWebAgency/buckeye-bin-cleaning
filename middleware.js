import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only protect admin routes that aren't the login page
  if (
    request.nextUrl.pathname.startsWith('/admin') && 
    !request.nextUrl.pathname.includes('/admin/login')
  ) {
    // This approach will let client-side auth handle the actual protection
    // It acts as a fallback for users without JS or initial loads
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Always allow the login page to render
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};