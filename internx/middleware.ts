import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Fail closed in production: never sign/verify tokens with a guessable default.
// In development we keep a throwaway value so `next dev` still boots without .env.
const RAW_JWT_SECRET = process.env.JWT_SECRET
if (!RAW_JWT_SECRET && process.env.NODE_ENV === 'production') {
  // Throwing here aborts middleware init and surfaces a loud misconfiguration
  // instead of silently accepting tokens signed with a public default secret.
  throw new Error('JWT_SECRET is not set. Refusing to run in production without it.')
}
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || 'dev-only-insecure-jwt-secret-do-not-use-in-prod'
)

const COOKIE_NAME = 'auth_token'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let NextAuth handle its own API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const nextAuthToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  let isAuthenticated = false
  let userPayload: any = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      isAuthenticated = true
      userPayload = payload
    } catch {
      // Token is invalid or expired
    }
  } else if (nextAuthToken) {
    // Authenticated via Google OAuth (NextAuth)
    isAuthenticated = true
    userPayload = { role: 'student' }
  }

  // 1. Allow access to /admin/login (separate admin login page)
  if (pathname === '/admin/login') {
    if (isAuthenticated && userPayload?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // 2. Protect /admin routes -> redirect unauthenticated to /admin/login
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || userPayload?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // 3. Protect /dashboard -> redirect unauthenticated to /login
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 4. Redirect authenticated users away from student login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    if (isAuthenticated) {
      const dest = userPayload?.role === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}
