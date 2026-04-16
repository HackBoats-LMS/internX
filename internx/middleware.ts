import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'auth_token'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    let user = null

    // 1. Verify custom JWT token from cookie
    const cookie = request.cookies.get(COOKIE_NAME)
    const token = cookie?.value

    if (token) {
      try {
        const secretString = process.env.JWT_SECRET || 'default_secret_key_1234567890_change_me'
        const secret = new TextEncoder().encode(secretString)
        const { payload } = await jwtVerify(token, secret)
        user = payload
      } catch (e) {
        // Token invalid or expired - just treat as unauthenticated
      }
    }

    // 2. Define routes
    const isPublicRoute = [
      '/', 
      '/login', 
      '/signup', 
      '/payment',
      '/forgot-password',
      '/favicon.ico'
    ].includes(pathname) || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/forgot-password/verify')

    // 3. Redirect logic
    if (!user && !isPublicRoute) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (user && (pathname === '/login' || pathname === '/signup')) {
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
  } catch (error) {
    // If anything fails, we let the request pass rather than 500ing the site
    console.error("Middleware critical error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
