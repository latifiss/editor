import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith('/admin');
  
  if (path === '/admin/login' || path === '/admin/register') {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('admin_access_token')?.value;

  if (isAdminPath && !accessToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};