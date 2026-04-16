import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'auth_token'

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  let user = null

  // 1. Verify custom JWT token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'default_secret_key_1234567890_change_me'
      )
      const { payload } = await jwtVerify(token, secret)
      user = payload
    } catch (e) {
      // Token invalid or expired - we ignore and let the check below handle it
    }
  }

  // 2. Define routes
  const isPublicRoute = ['/', '/login', '/signup', '/payment'].includes(pathname) || 
                       pathname.startsWith('/api') || 
                       pathname.startsWith('/_next') || 
                       pathname.startsWith('/favicon.ico') ||
                       pathname.startsWith('/forgot-password') ||
                       pathname.startsWith('/auth/callback')

  // 3. Redirect logic
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.svg, .png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
