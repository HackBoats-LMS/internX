import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.svg, .png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    
    // Simple check: Is a session cookie present?
    const hasToken = request.cookies.has('auth_token')

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
    pathname.startsWith('/auth/callback')

    // Redirect unauthenticated users
    if (!hasToken && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (hasToken && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.next()
  }
}
