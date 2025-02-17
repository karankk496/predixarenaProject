import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  isSuperUser: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need authentication
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Check for token in protected routes
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    console.log('Auth Header:', authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fix: Remove all instances of 'Bearer ' and trim whitespace
    const token = authHeader.replace(/Bearer\s+/g, '').trim();
    console.log('Cleaned Token:', token);

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret) as { payload: JWTPayload };
      console.log('Decoded Token:', payload); // Debug log

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-role', payload.role as string);

      const response = NextResponse.next({
        headers: requestHeaders,
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

  try {
    const token = request.cookies.get('token')?.value;
    
    // If no token exists, just continue
    if (!token) {
      return NextResponse.next();
    }

    // Debug logs
    console.log('Token found:', token.substring(0, 20) + '...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    try {
      const { payload } = await jwtVerify(token, secret);
      console.log('Token verified successfully');
      return NextResponse.next();
    } catch (verifyError) {
      console.log('Token verification failed:', verifyError);
      // Clear the invalid token
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/api/((?!auth).*)' // Matches all /api/ routes except /api/auth
  ]
}; 