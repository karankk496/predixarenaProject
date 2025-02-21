import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'karansingh'; // Fallback for development

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  isSuperUser: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Public routes that don't need authentication
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/test') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    // Allow public access to approved events
    (pathname === '/api/events' && searchParams.get('status') === 'approved')
  ) {
    return NextResponse.next()
  }

  // Check for token in protected routes
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    // console.log('Auth Header:', authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fix: Remove all instances of 'Bearer ' and trim whitespace
    const token = authHeader.replace(/Bearer\s+/g, '').trim();
    //console.log('Cleaned Token:', token);

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret) as { payload: JWTPayload };
   //   console.log('Decoded Token:', payload); // Debug log

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-role', payload.role);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return response;
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)',
  ],
} 