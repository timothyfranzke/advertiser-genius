import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/portal',
  '/tv/display'
];

// Paths that are public (no authentication required)
const publicPaths = [
  '/',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/reset-password',
  '/tv/setup'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(prefix => 
    path === prefix || path.startsWith(`${prefix}/`)
  );

  const isPublicPath = publicPaths.some(prefix => 
    path === prefix || path.startsWith(`${prefix}/`)
  );
  
  // If the path doesn't require authentication, proceed as normal
  if (!isProtectedPath || isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the Firebase ID token from the cookie
  const session = request.cookies.get('session')?.value;
  
  // If no session exists, redirect to the signin page
  if (!session) {
    const url = new URL('/api/auth/signin', request.url);
    url.searchParams.set('redirect', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  try {
    // Validate the session token (in a real app, you would verify with Firebase Admin SDK)
    // For this example, we'll just check if it exists
    return NextResponse.next();
  } catch (error) {
    // If token validation fails, redirect to signin
    const url = new URL('/api/auth/signin', request.url);
    url.searchParams.set('redirect', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (app's static image files)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
